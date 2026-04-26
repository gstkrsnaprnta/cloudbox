import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import {
  formatCloudBox,
  getContainerStatus,
  getPublicUrl,
  resetContainer,
  restartContainer,
  startContainer,
  stopContainer
} from "../services/dockerService.js";

const router = Router();

router.use(requireAuth);

async function findUserBox(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(422).json({ message: "Invalid KloudBox id." });
    return null;
  }

  const cloudBox = await prisma.cloudBox.findFirst({
    where: { id, userId: req.user.id }
  });

  if (!cloudBox) {
    res.status(404).json({ message: "KloudBox not found." });
    return null;
  }

  return cloudBox;
}

async function updateBoxStatus(cloudBox, status) {
  const updatedBox = await prisma.cloudBox.update({
    where: { id: cloudBox.id },
    data: {
      status,
      ...(status === "RUNNING" ? { publicUrl: getPublicUrl(cloudBox.webPort) } : {})
    }
  });
  return formatCloudBox(updatedBox);
}

router.get("/me", async (req, res, next) => {
  try {
    const cloudBox = await prisma.cloudBox.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });

    if (!cloudBox) {
      return res.json({ box: null });
    }

    const status = await getContainerStatus(cloudBox.containerName);
    const updatedBox = await prisma.cloudBox.update({
      where: { id: cloudBox.id },
      data: { status }
    });

    if (status === "ERROR") {
      return res.json({
        box: formatCloudBox(updatedBox),
        message: "Container not found on Docker host"
      });
    }

    res.json({ box: formatCloudBox(updatedBox) });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/start", async (req, res, next) => {
  try {
    const cloudBox = await findUserBox(req, res);
    if (!cloudBox) return;

    const status = await startContainer(cloudBox.containerName);
    res.json({ box: await updateBoxStatus(cloudBox, status) });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/stop", async (req, res, next) => {
  try {
    const cloudBox = await findUserBox(req, res);
    if (!cloudBox) return;

    const status = await stopContainer(cloudBox.containerName);
    res.json({ box: await updateBoxStatus(cloudBox, status) });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/restart", async (req, res, next) => {
  try {
    const cloudBox = await findUserBox(req, res);
    if (!cloudBox) return;

    await prisma.cloudBox.update({
      where: { id: cloudBox.id },
      data: { status: "RESTARTING" }
    });

    const status = await restartContainer(cloudBox.containerName);
    res.json({ box: await updateBoxStatus(cloudBox, status) });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/reset", async (req, res, next) => {
  try {
    const cloudBox = await findUserBox(req, res);
    if (!cloudBox) return;

    await prisma.cloudBox.update({
      where: { id: cloudBox.id },
      data: { status: "CREATING" }
    });

    const status = await resetContainer(cloudBox);
    res.json({ box: await updateBoxStatus(cloudBox, status) });
  } catch (error) {
    next(error);
  }
});

export default router;
