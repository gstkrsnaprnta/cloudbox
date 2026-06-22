import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import {
  formatCloudBox,
  getContainerStatus,
  removeContainer,
  startContainer,
  stopContainer
} from "../services/dockerService.js";

const router = Router();

router.get("/stats", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrders,
      paidOrders,
      pendingOrders,
      totalBoxes,
      runningBoxes,
      revenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.cloudBox.count(),
      prisma.cloudBox.count({ where: { status: "RUNNING" } }),
      prisma.order.aggregate({ _sum: { amount: true }, where: { status: "PAID" } })
    ]);

    res.json({
      totalUsers,
      totalOrders,
      paidOrders,
      pendingOrders,
      totalBoxes,
      runningBoxes,
      totalRevenue: revenue._sum.amount || 0
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true, cloudBoxes: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.get("/orders", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        package: { select: { id: true, name: true, slug: true, price: true } },
        cloudBox: true
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.get("/boxes", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const boxes = await prisma.cloudBox.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, externalId: true, status: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const boxesWithStatus = await Promise.all(
      boxes.map(async (box) => {
        const liveStatus = await getContainerStatus(box.containerName).catch(() => "UNKNOWN");
        const formatted = formatCloudBox(box);
        return {
          ...box,
          ...formatted,
          liveStatus,
          user: box.user,
          order: box.order
        };
      })
    );

    res.json({ boxes: boxesWithStatus });
  } catch (error) {
    next(error);
  }
});

router.get("/webhook-logs", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const logs = await prisma.webhookLog.findMany({
      include: {
        order: { select: { id: true, externalId: true, status: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

router.post("/boxes/:id/start", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const box = await prisma.cloudBox.findUnique({ where: { id: Number(req.params.id) } });
    if (!box) return res.status(404).json({ message: "Box not found." });
    const status = await startContainer(box.containerName);
    const updated = await prisma.cloudBox.update({
      where: { id: box.id },
      data: { status }
    });
    res.json({ box: updated });
  } catch (error) {
    next(error);
  }
});

router.post("/boxes/:id/stop", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const box = await prisma.cloudBox.findUnique({ where: { id: Number(req.params.id) } });
    if (!box) return res.status(404).json({ message: "Box not found." });
    const status = await stopContainer(box.containerName);
    const updated = await prisma.cloudBox.update({
      where: { id: box.id },
      data: { status }
    });
    res.json({ box: updated });
  } catch (error) {
    next(error);
  }
});

router.delete("/boxes/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const box = await prisma.cloudBox.findUnique({ where: { id: Number(req.params.id) } });
    if (!box) return res.status(404).json({ message: "Box not found." });
    await removeContainer(box.containerName);
    await prisma.cloudBox.delete({ where: { id: box.id } });
    res.json({ message: "Box deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
