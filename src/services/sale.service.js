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

export async function createSale({ payload, user }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) Générer la référence (dans la session)
    const now = new Date(payload.dateExacte || Date.now());
    const reference = await generateReference(now, session);

    // 2) Client : création ou récupération (si présent)
    const clientId = payload.client ? await getOrCreateClientForSale(payload.client, session) : null;

    // 3) Vérifier et mettre à jour le stock (chaque update utilise la session)
    await validateAndUpdateProductsForSale(payload.items, session);

    // 4) Calculer sommes (le DTO doit déjà avoir calculé mais on refait pour sûreté)
    const payments = Array.isArray(payload.payments) ? payload.payments : [];
    const paymentsSum = payments.reduce((s, p) => s + Number(p.amount), 0);
    const accountTotal = payments
      .filter(p => String(p.method).toLowerCase() === "account")
      .reduce((s, p) => s + Number(p.amount), 0);

      const total = Number(payload.total);
      const amountDue = Math.max(0, total - paymentsSum);

    // 5) Déterminer status final (conserver cohérence)
    let finalStatus = payload.status;
    if (amountDue === 0) finalStatus = "paid";
    else if (paymentsSum > 0) finalStatus = "partial";

    // 6) Créer la vente (avec amountDue et status cohérent)
    const data = {
      reference,
      client: clientId,
      items: payload.items,
      dateExacte: payload.dateExacte || now,
      remise: payload.remise || 0,
      total,
      vendeur: user?.id,
      status: finalStatus,
      amountDue
    };

    const [sale] = await Sale.create([data], { session });

    // 7) Si paiement via account présent -> débiter le compte (une seule opération)
    if (accountTotal > 0) {
      if (!clientId) {
        throw new HttpError(400, "Client requis pour paiement depuis le compte.");
      }
      // debit lève HttpError si solde insuffisant
      await debit(clientId, accountTotal, {
        session,
        reference: sale._id.toString(),
        description: `Paiement depuis compte pour vente ${sale.reference}`,
        relatedSaleId: sale._id,
        createdBy: user?.id
      });
    }

    // 8) Créer les Payments (un document par entrée dans payload.payments)
    if (payments.length > 0) {
      const paymentsToCreate = payments.map(p => ({
        sale: sale._id,
        amount: Number(p.amount),
        method: p.method
      }));
      await createPaymentsForSale(paymentsToCreate, session);
    }

    // 9) History
    const description = getSaleDescription({
      status: finalStatus,
      total,
      amountPaid: paymentsSum,
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

    // 10) Commit transaction
    await session.commitTransaction();
    session.endSession();

    return sale;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err.status && err.message) throw err; // HttpError
    console.error("createSale unexpected error:", err);
    throw new HttpError(500, "Erreur lors de la création de la vente.");
  }
}
