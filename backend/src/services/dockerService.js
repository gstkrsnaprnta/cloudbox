import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

const execFileAsync = promisify(execFile);
const WEB_FOLDER = "/home/student/public_html";

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function mapDockerError(error) {
  const message = `${error.stderr || error.stdout || error.message || ""}`.trim();
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("cannot connect to the docker daemon")) {
    return new Error("Docker belum berjalan. Buka Docker Desktop atau start Docker daemon terlebih dahulu.");
  }

  if (normalizedMessage.includes("unable to find image") || normalizedMessage.includes("no such image")) {
    return new Error(`Docker image ${env.dockerImage} belum ada. Build dulu: docker build -t ${env.dockerImage} docker/cloudbox-static-ssh`);
  }

  if (normalizedMessage.includes("port is already allocated") || normalizedMessage.includes("bind for 0.0.0.0")) {
    return new Error(
      `Port ${env.cloudBoxSshPort} atau ${env.cloudBoxWebPort} sedang dipakai. Hapus container lama atau ganti port.`
    );
  }

  if (normalizedMessage.includes("no such container") || normalizedMessage.includes("no such object")) {
    const notFoundError = new Error("Container tidak ditemukan.");
    notFoundError.code = "CONTAINER_NOT_FOUND";
    return notFoundError;
  }

  return new Error(message || "Docker command gagal.");
}

async function runDocker(args) {
  try {
    const result = await execFileAsync("docker", args, { timeout: 30000 });
    return result.stdout.trim();
  } catch (error) {
    throw mapDockerError(error);
  }
}

function isMissingContainerError(error) {
  return error.code === "CONTAINER_NOT_FOUND" || error.message === "Container tidak ditemukan.";
}

function getPublicUrl(webPort) {
  const appUrl = env.appUrl.replace(/\/$/, "");

  if (appUrl.includes("localhost") || appUrl.includes("127.0.0.1")) {
    return `http://localhost:${webPort}`;
  }

  return `${appUrl}/sites/riansyah/`;
}

export function formatCloudBox(cloudBox) {
  if (!cloudBox) {
    return null;
  }

  return {
    id: cloudBox.id,
    containerName: cloudBox.containerName,
    status: cloudBox.status,
    sshHost: cloudBox.sshHost,
    sshPort: cloudBox.sshPort,
    webPort: cloudBox.webPort,
    username: cloudBox.username,
    password: cloudBox.password,
    webFolder: WEB_FOLDER,
    publicUrl: cloudBox.publicUrl,
    scpCommand: `scp -P ${cloudBox.sshPort} -r my-website/* ${cloudBox.username}@${cloudBox.sshHost}:${WEB_FOLDER}/`,
    sshCommand: `ssh ${cloudBox.username}@${cloudBox.sshHost} -p ${cloudBox.sshPort}`
  };
}

export async function getContainerStatus(containerName) {
  try {
    const output = await runDocker(["inspect", "-f", "{{.State.Status}}", containerName]);
    if (output === "running") {
      return "RUNNING";
    }
    if (output === "exited" || output === "created") {
      return "STOPPED";
    }
    return output.toUpperCase();
  } catch (error) {
    if (isMissingContainerError(error)) {
      return "ERROR";
    }
    throw error;
  }
}

async function containerExists(containerName) {
  try {
    await runDocker(["inspect", containerName]);
    return true;
  } catch (error) {
    if (isMissingContainerError(error)) {
      return false;
    }
    throw error;
  }
}

async function runCloudBoxContainer({ containerName, hostname, sshPort, webPort }) {
  await runDocker([
    "run",
    "-dit",
    "--name",
    containerName,
    "--hostname",
    hostname,
    "--memory=128m",
    "--memory-swap=128m",
    "--cpus=0.2",
    "--pids-limit=64",
    "--security-opt",
    "no-new-privileges",
    "-p",
    `${sshPort}:22`,
    "-p",
    `${webPort}:80`,
    env.dockerImage
  ]);
}

async function refreshCloudBoxStatus(cloudBox) {
  const status = await getContainerStatus(cloudBox.containerName);
  return prisma.cloudBox.update({
    where: { id: cloudBox.id },
    data: { status }
  });
}

async function ensureContainerRunning(cloudBox) {
  if (await containerExists(cloudBox.containerName)) {
    await startContainer(cloudBox.containerName);
  } else {
    await runCloudBoxContainer({
      containerName: cloudBox.containerName,
      hostname: cloudBox.hostname,
      sshPort: cloudBox.sshPort,
      webPort: cloudBox.webPort
    });
  }

  return prisma.cloudBox.update({
    where: { id: cloudBox.id },
    data: {
      status: "RUNNING",
      publicUrl: getPublicUrl(cloudBox.webPort)
    }
  });
}

export async function provisionCloudBoxAfterPayment(orderInput) {
  const order = await prisma.order.findUnique({
    where: { id: orderInput.id },
    include: { user: true, package: true, cloudBox: true }
  });

  if (!order) {
    throw new Error("Order tidak ditemukan untuk provisioning KloudBox.");
  }

  if (order.cloudBox) {
    try {
      return await ensureContainerRunning(order.cloudBox);
    } catch (error) {
      await prisma.cloudBox.update({
        where: { id: order.cloudBox.id },
        data: { status: "ERROR" }
      });
      throw error;
    }
  }

  const existingUserBox = await prisma.cloudBox.findFirst({
    where: { userId: order.userId }
  });

  if (existingUserBox) {
    const reassignedBox = await prisma.cloudBox.update({
      where: { id: existingUserBox.id },
      data: {
        orderId: order.id,
        sshHost: env.sshHost,
        username: env.cloudBoxUsername,
        password: env.cloudBoxPassword,
        publicUrl: getPublicUrl(existingUserBox.webPort),
        status: "CREATING"
      }
    });

    try {
      return await ensureContainerRunning(reassignedBox);
    } catch (error) {
      await prisma.cloudBox.update({
        where: { id: reassignedBox.id },
        data: { status: "ERROR" }
      });
      throw error;
    }
  }

  const containerName = `cloudbox-user-${order.userId}`;
  const hostname = containerName;
  const sshPort = env.cloudBoxSshPort;
  const webPort = env.cloudBoxWebPort;

  const expiresAt = addDays(new Date(), env.cloudBoxDurationDays || order.package.activeDays || 7);

  const cloudBox = await prisma.cloudBox.create({
    data: {
      userId: order.userId,
      orderId: order.id,
      containerName,
      hostname,
      sshHost: env.sshHost,
      sshPort,
      webPort,
      username: env.cloudBoxUsername,
      password: env.cloudBoxPassword,
      publicUrl: getPublicUrl(webPort),
      status: "CREATING",
      expiresAt
    }
  });

  try {
    return await ensureContainerRunning(cloudBox);
  } catch (error) {
    await prisma.cloudBox.update({
      where: { id: cloudBox.id },
      data: { status: "ERROR" }
    });
    throw error;
  }
}

export async function startContainer(containerName) {
  await runDocker(["start", containerName]);
  return getContainerStatus(containerName);
}

export async function stopContainer(containerName) {
  await runDocker(["stop", containerName]);
  return getContainerStatus(containerName);
}

export async function restartContainer(containerName) {
  await runDocker(["restart", containerName]);
  return getContainerStatus(containerName);
}

export async function removeContainer(containerName) {
  if (await containerExists(containerName)) {
    await runDocker(["rm", "-f", containerName]);
  }
}

export async function resetContainer(cloudBox) {
  await removeContainer(cloudBox.containerName);
  await runCloudBoxContainer({
    containerName: cloudBox.containerName,
    hostname: cloudBox.hostname,
    sshPort: cloudBox.sshPort,
    webPort: cloudBox.webPort
  });
  return "RUNNING";
}

export { getPublicUrl };
