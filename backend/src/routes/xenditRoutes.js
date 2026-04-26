import { Router } from "express";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { provisionCloudBoxAfterPayment } from "../services/provisioningService.js";

const router = Router();

function isPaidStatus(status) {
  return ["PAID", "SETTLED"].includes(String(status || "").toUpperCase());
}

function normalizeStatus(status) {
  return String(status || "").toUpperCase();
}

function logWebhookError(message, error) {
  console.error(`[xendit-webhook] ${message}`, {
    message: error?.message,
    name: error?.name
  });
}

router.post("/webhook", async (req, res) => {
  const callbackToken = req.header("X-CALLBACK-TOKEN") || req.header("x-callback-token");

  if (!env.xenditCallbackToken || callbackToken !== env.xenditCallbackToken) {
    return res.status(401).json({ message: "Invalid Xendit callback token." });
  }

  const payload = req.body && typeof req.body === "object" ? req.body : {};
  const externalId = payload.external_id;
  const invoiceId = payload.id;
  const status = normalizeStatus(payload.status);
  const eventType = status || payload.event || payload.type || "UNKNOWN";

  try {
    let order = null;

    if (externalId) {
      order = await prisma.order.findUnique({
        where: { externalId },
        include: { cloudBox: true }
      });
    }

    if (!order && invoiceId) {
      order = await prisma.order.findUnique({
        where: { xenditInvoiceId: invoiceId },
        include: { cloudBox: true }
      });
    }

    await prisma.webhookLog.create({
      data: {
        orderId: order?.id,
        eventType,
        payload: JSON.stringify(payload)
      }
    });

    if (!externalId) {
      return res.json({ message: "Webhook received but ignored", reason: "missing external_id" });
    }

    if (!order) {
      return res.json({
        message: "Webhook received but ignored",
        reason: "order not found",
        external_id: externalId
      });
    }

    if (isPaidStatus(status)) {
      if (order.status === "PAID" && order.cloudBox) {
        return res.json({ message: "Invoice paid webhook processed" });
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

      await prisma.order.update({
        where: { id: order.id },
        data: {
          provisionStatus: cloudBox.status,
          provisionedAt: new Date()
        }
      });
      return res.json({ message: "Invoice paid webhook processed" });
    }

    if (status === "EXPIRED") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "EXPIRED" }
      });
      return res.json({ message: "Webhook received but ignored", reason: "invoice expired" });
    }

    return res.json({
      message: "Webhook received but ignored",
      reason: "status ignored",
      status: status || "UNKNOWN"
    });
  } catch (error) {
    logWebhookError("Internal error while processing payload.", error);
    return res.status(500).json({ message: "Webhook processing failed." });
  }
});

export default router;
