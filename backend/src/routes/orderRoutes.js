import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { provisionCloudBoxAfterPayment } from "../services/dockerService.js";
import { createXenditInvoice } from "../services/xenditService.js";

const router = Router();

const createOrderSchema = z.object({
  packageId: z.number().int().positive()
});

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { package: true, cloudBox: true },
      orderBy: { createdAt: "desc" }
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const input = createOrderSchema.parse(req.body);
    const selectedPackage = await prisma.package.findFirst({
      where: { id: input.packageId, isActive: true }
    });

    if (!selectedPackage) {
      return res.status(404).json({ message: "Package not found." });
    }

    const externalId = `cloudbox-${req.user.id}-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        packageId: selectedPackage.id,
        externalId,
        amount: selectedPackage.price,
        status: "PENDING"
      }
    });

    let invoice;

    try {
      invoice = await createXenditInvoice({
        externalId,
        amount: selectedPackage.price,
        payerEmail: req.user.email,
        description: `CloudBox ${selectedPackage.name}`
      });
    } catch (error) {
      const failedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
        include: { package: true, cloudBox: true }
      });

      if (env.appEnv !== "production") {
        return res.status(201).json({
          order: failedOrder,
          message: "Order dibuat, tetapi Xendit gagal. Gunakan Mark Paid untuk demo development.",
          paymentError: error.message
        });
      }

      throw error;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        xenditInvoiceId: invoice.id,
        invoiceUrl: invoice.invoice_url,
        status: invoice.status || "PENDING"
      },
      include: { package: true, cloudBox: true }
    });

    res.status(201).json({ order: updatedOrder });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/mark-paid", async (req, res, next) => {
  try {
    if (env.appEnv === "production") {
      return res.status(404).json({ message: "Route not found." });
    }

    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      return res.status(422).json({ message: "Invalid order id." });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
      include: { cloudBox: true }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const paidOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: order.paidAt || new Date(),
        provisionStatus: order.cloudBox ? order.provisionStatus : "CREATING"
      }
    });

    const cloudBox = await provisionCloudBoxAfterPayment(paidOrder);

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        provisionStatus: cloudBox.status,
        provisionedAt: new Date()
      },
      include: { package: true, cloudBox: true }
    });

    res.json({ order: updatedOrder, box: cloudBox });
  } catch (error) {
    next(error);
  }
});

export default router;
