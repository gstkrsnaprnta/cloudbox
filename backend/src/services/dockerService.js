import { execFile, spawn } from "node:child_process";
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

  return `${appUrl}/sites/gustikrisnapranata/`;
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

async function runDockerWithStdin(args, input) {
  return new Promise((resolve, reject) => {
    const proc = spawn("docker", args, { timeout: 10000 });
    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr.trim() || `docker exit ${code}`));
      }
    });
    proc.stdin.end(input);
  });
}

function buildWelcomePage(cloudBox) {
  const publicUrl = getPublicUrl(cloudBox.webPort);
  const sshHost = cloudBox.sshHost || env.sshHost;
  const sshPort = cloudBox.sshPort;
  const username = cloudBox.username || env.cloudBoxUsername;
  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>KloudBox Container Ready</title>
    <style>
      *,*::before,*::after{box-sizing:border-box}
      body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;max-width:760px;margin:0 auto;padding:48px 24px;background:#f5f7fb;color:#102a43;line-height:1.6}
      h1{color:#0f766e;font-size:32px;margin:8px 0 12px}
      h3{margin:0 0 12px;font-size:16px;color:#102a43}
      p{margin:8px 0;color:#34495e}
      code{font-family:"SFMono-Regular",Consolas,monospace;background:#eef2f6;padding:2px 6px;border-radius:4px;font-size:13px}
      pre{background:#17202a;color:#d9f99d;padding:16px;border-radius:8px;overflow-x:auto;margin:0;font-size:13px;line-height:1.5}
      .badge{display:inline-flex;align-items:center;gap:6px;background:#ecfdf5;color:#047857;border:1px solid #6ee7b7;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:700}
      .dot{width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;animation:pulse 1.5s ease-in-out infinite}
      .card{background:#fff;border:1px solid #dde4ee;border-radius:12px;padding:20px;margin-top:18px;box-shadow:0 4px 12px rgba(15,35,55,.04)}
      .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:16px}
      .info{background:#f8fafc;border:1px solid #e5edf5;border-radius:8px;padding:12px}
      .info span{display:block;font-size:11px;text-transform:uppercase;font-weight:800;color:#536273;margin-bottom:4px}
      .info strong{font-family:"SFMono-Regular",Consolas,monospace;font-size:13px;word-break:break-all}
      footer{margin-top:32px;color:#64748b;font-size:13px;text-align:center}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    </style>
  </head>
  <body>
    <span class="badge"><span class="dot"></span>RUNNING</span>
    <h1>KloudBox container kamu siap 🎉</h1>
    <p>Container Linux ini di-provision otomatis setelah pembayaran berhasil. Kamu bisa login via SSH dan upload website statis (HTML/CSS/JS) ke folder <code>public_html</code>. Begitu kamu replace file ini dengan website kamu sendiri, halaman ini akan tergantikan.</p>

    <div class="grid">
      <div class="info"><span>Container</span><strong>${cloudBox.containerName}</strong></div>
      <div class="info"><span>Status</span><strong>RUNNING</strong></div>
      <div class="info"><span>SSH Host</span><strong>${sshHost}</strong></div>
      <div class="info"><span>SSH Port</span><strong>${sshPort}</strong></div>
      <div class="info"><span>Username</span><strong>${username}</strong></div>
      <div class="info"><span>Folder Web</span><strong>${WEB_FOLDER}</strong></div>
    </div>

    <div class="card">
      <h3>1) Upload via SCP (1 command, dari folder website lokal)</h3>
      <pre>scp -P ${sshPort} -r my-website/* ${username}@${sshHost}:${WEB_FOLDER}/</pre>
    </div>

    <div class="card">
      <h3>2) Atau SSH lalu edit langsung di container</h3>
      <pre>ssh ${username}@${sshHost} -p ${sshPort}
# masukkan password lalu:
nano ${WEB_FOLDER}/index.html</pre>
    </div>

    <div class="card">
      <h3>3) Cek website</h3>
      <p>Buka <a href="${publicUrl}">${publicUrl}</a> di browser. Refresh setelah upload untuk melihat website kamu live.</p>
    </div>

    <footer>Powered by KloudBox · Docker Container · Nginx Reverse Proxy · Xendit Payment</footer>
  </body>
</html>
`;
}

async function seedWelcomePage(cloudBox) {
  try {
    const html = buildWelcomePage(cloudBox);
    await runDockerWithStdin(
      ["exec", "-i", cloudBox.containerName, "sh", "-c", `cat > ${WEB_FOLDER}/index.html`],
      html
    );
    await runDocker(["exec", cloudBox.containerName, "chown", "student:student", `${WEB_FOLDER}/index.html`]).catch(() => {});
  } catch (error) {
    console.warn("[cloudbox] seedWelcomePage failed (non-fatal):", error.message);
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

async function ensureContainerRunning(cloudBox, { seedWelcome = false } = {}) {
  let createdNew = false;
  if (await containerExists(cloudBox.containerName)) {
    await startContainer(cloudBox.containerName);
  } else {
    await runCloudBoxContainer({
      containerName: cloudBox.containerName,
      hostname: cloudBox.hostname,
      sshPort: cloudBox.sshPort,
      webPort: cloudBox.webPort
    });
    createdNew = true;
  }

  if (seedWelcome && createdNew) {
    // Wait briefly for sshd/nginx to be up before seeding
    await new Promise((r) => setTimeout(r, 1500));
    await seedWelcomePage(cloudBox);
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
      return await ensureContainerRunning(reassignedBox, { seedWelcome: true });
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
    return await ensureContainerRunning(cloudBox, { seedWelcome: true });
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
