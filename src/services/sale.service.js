// /services/sale.service.js
import mongoose from "mongoose";
import Sale from "@/models/Sale.model";
import { generateReference } from "./generateReference.service";
import { getOrCreateClientForSale } from "./client.service";
import { validateAndUpdateProductsForSale } from "./product.service";
import { createPaymentsForSale } from "./payment.service";
import { createHistory } from "./history.service";
import { HttpError } from "./errors.service";
import { getSaleDescription } from "@/utils/getSaleDescription"; // tu peux laisser en utils

export async function createSale({ rawPayload, user }, options = {}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // validation DTO doit être fait en amont — on considère ici que rawPayload est déjà validé.
    const payload = rawPayload;
    const now = new Date(payload.dateExacte || Date.now());

    // reference
    const reference = await generateReference(now, session);

    // client
    let clientId = null;
    if (payload.client) {
      clientId = await getOrCreateClientForSale(payload.client, session);
    }

    // update stock (valide + modifie)
    await validateAndUpdateProductsForSale(payload.items, session);

    // build sale data
    const data = {
      reference,
      client: clientId,
      items: payload.items,
      dateExacte: payload.dateExacte || now,
      remise: payload.remise || 0,
      total: payload.total,
      vendeur: user?.id,
      status: payload.status,
    };

    if (payload.status === "partial" || payload.status === "pending") {
      data.amountDue = payload.total - (payload.amountPaid || 0);
    }

    const [sale] = await Sale.create([data], { session });

    // payments
    const paymentsToCreate = [];
    if (payload.status === "partial" || payload.status === "paid") {
      paymentsToCreate.push({
        sale: sale._id,
        amount: payload.status === "paid" ? payload.total : payload.amountPaid,
        paymentMethod: payload.paymentMethod,
      });
      await createPaymentsForSale(paymentsToCreate, session);
    }

    // history
    const description = getSaleDescription({
      status: payload.status,
      total: payload.total,
      amountPaid: payload.amountPaid,
      reference: sale.reference,
      userName: user?.name
    });

    await createHistory({
      userId: user?.id,
      action: "create",
      resource: "sale",
      resourceId: sale._id,
      description
    }, session);

    await session.commitTransaction();
    session.endSession();

    return sale;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err.status && err.message) throw err; // HttpError
    throw new HttpError(500, "Erreur lors de la création de la vente.");
  }
}
