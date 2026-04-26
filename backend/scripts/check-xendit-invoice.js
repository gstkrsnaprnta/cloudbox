#!/usr/bin/env node
import "../src/config/env.js";
import { getXenditInvoice } from "../src/services/xenditService.js";

const invoiceId = process.argv[2];

if (!invoiceId) {
  console.error("Usage: node scripts/check-xendit-invoice.js inv_xxx");
  process.exit(1);
}

try {
  const invoice = await getXenditInvoice(invoiceId);

  console.log(`Invoice ID: ${invoice.id}`);
  console.log(`External ID: ${invoice.external_id}`);
  console.log(`Amount: ${invoice.amount}`);
  console.log(`Status: ${invoice.status}`);
  console.log(`Invoice URL: ${invoice.invoice_url}`);
} catch (error) {
  console.error(`Failed to fetch invoice: ${error.message}`);
  process.exit(1);
}
