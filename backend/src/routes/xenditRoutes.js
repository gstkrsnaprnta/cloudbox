import { Router } from "express";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { provisionCloudBoxAfterPayment } from "../services/provisioningService.js";

const router = Router();

function isPaidStatus(status) {
  return ["PAID", "SETTLED"].includes(String(status || "").toUpperCase());
}

router.post("/webhook", async (req, res, next) => {
  try {
    const callbackToken = req.header("x-callback-token");

    if (!env.xenditCallbackToken || callbackToken !== env.xenditCallbackToken) {
      return res.status(401).json({ message: "Invalid Xendit callback token." });
    }

    const payload = req.body;
    const externalId = payload.external_id;
    const invoiceId = payload.id;
    const status = String(payload.status || "").toUpperCase();

    const orderLookup = [
      externalId ? { externalId } : null,
      invoiceId ? { xenditInvoiceId: invoiceId } : null
    ].filter(Boolean);

    const order = orderLookup.length
      ? await prisma.order.findFirst({ where: { OR: orderLookup } })
      : null;

    await prisma.webhookLog.create({
      data: {
        orderId: order?.id,
        eventType: status || "UNKNOWN",
        payload: JSON.stringify(payload)
      }
    });

    if (!order) {
      return res.status(202).json({ message: "Webhook logged, order not found." });
    }

    if (isPaidStatus(status)) {
      const paidOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: order.paidAt || new Date(),
          provisionStatus: "CREATING"
        }
      });

      const cloudBox = await provisionCloudBoxAfterPayment(paidOrder);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          provisionStatus: cloudBox.status,
          provisionedAt: new Date()
        }
      });
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: status || order.status }
      });
    }

    res.json({ message: "Webhook received." });
  } catch (error) {
    next(error);
  }
});

export default router;
