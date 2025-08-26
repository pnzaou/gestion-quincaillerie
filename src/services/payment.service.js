import Payment from "@/models/Payment.model";

export async function createPaymentsForSale(payments = [], session = null) {
  if (!payments.length) return;
  await Payment.create(payments, { session });
}