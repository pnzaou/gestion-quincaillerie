import mongoose from "mongoose";
import Sale from "@/models/Sale.model";
import { generateReference } from "./generateReference.service";
import { getOrCreateClientForSale } from "./client.service";
import { validateAndUpdateProductsForSale } from "./product.service";
import { createPaymentsForSale } from "./payment.service";
import { createHistory } from "./history.service";
import { HttpError } from "./errors.service";
import { getSaleDescription } from "@/utils/getSaleDescription";
import { debit } from "./account.service";

export async function createSale({ payload, user }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ Vérifier businessId
    if (!payload.businessId) {
      throw new HttpError(400, "ID de la boutique manquant.");
    }

    const businessObjectId = new mongoose.Types.ObjectId(payload.businessId);

    // 1) Générer la référence (dans la session) - avec businessId
    const now = new Date(payload.dateExacte || Date.now());
    const reference = await generateReference(now, businessObjectId, session);

    // 2) Client : création ou récupération (si présent)
    const clientId = payload.client 
      ? await getOrCreateClientForSale(payload.client, businessObjectId, session) 
      : null;

    // 3) Vérifier et mettre à jour le stock (avec businessId pour sécurité)
    await validateAndUpdateProductsForSale(payload.items, businessObjectId, session);

    // 4) Calculer sommes
    const payments = Array.isArray(payload.payments) ? payload.payments : [];
    const paymentsSum = payments.reduce((s, p) => s + Number(p.amount), 0);
    const accountTotal = payments
      .filter(p => String(p.method).toLowerCase() === "account")
      .reduce((s, p) => s + Number(p.amount), 0);

    const total = Number(payload.total);
    const amountDue = Math.max(0, total - paymentsSum);

    // 5) Déterminer status final
    let finalStatus = payload.status;
    if (amountDue === 0) finalStatus = "paid";
    else if (paymentsSum > 0) finalStatus = "partial";

    // 6) Créer la vente
    const data = {
      business: businessObjectId, // ✅ Ajout du business
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

    // 7) Si paiement via account présent -> débiter le compte
    if (accountTotal > 0) {
      if (!clientId) {
        throw new HttpError(400, "Client requis pour paiement depuis le compte.");
      }
      await debit(clientId, accountTotal, {
        session,
        reference: sale.reference,
        description: "Achat via compte client",
        relatedSaleId: sale._id,
        createdBy: user?.id
      });
    }

    // 8) Créer les Payments (avec businessId)
    if (payments.length > 0) {
      const paymentsToCreate = payments.map(p => ({
        business: businessObjectId, // ✅ Ajout du business
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
      description,
      businessId: businessObjectId // ✅ Ajout du business
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