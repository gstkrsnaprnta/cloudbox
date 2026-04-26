import { env } from "../config/env.js";

const XENDIT_BASE_URL = "https://api.xendit.co/v2";

function getAuthHeader() {
  const token = Buffer.from(`${env.xenditSecretKey}:`).toString("base64");
  return `Basic ${token}`;
}

export async function createXenditInvoice({ externalId, amount, payerEmail, description }) {
  if (!env.xenditSecretKey) {
    throw new Error("XENDIT_SECRET_KEY is required to create invoices.");
  }

  const response = await fetch(`${XENDIT_BASE_URL}/invoices`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      external_id: externalId,
      amount,
      payer_email: payerEmail,
      description,
      success_redirect_url: env.xenditSuccessRedirectUrl,
      failure_redirect_url: env.xenditFailureRedirectUrl,
      currency: "IDR"
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.message || data?.error_code || "Failed to create Xendit invoice.";
    throw new Error(message);
  }

  return data;
}

export async function getXenditInvoice(invoiceId) {
  if (!env.xenditSecretKey) {
    throw new Error("XENDIT_SECRET_KEY is required to fetch invoices.");
  }

  const response = await fetch(`${XENDIT_BASE_URL}/invoices/${invoiceId}`, {
    headers: {
      Authorization: getAuthHeader()
    }
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.message || data?.error_code || "Failed to fetch Xendit invoice.";
    throw new Error(message);
  }

  return data;
}
