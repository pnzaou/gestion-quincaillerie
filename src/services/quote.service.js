import mongoose from "mongoose";
import Quote from "@/models/Quote.model";
import { generateReference } from "./generateReference.service";
import { getOrCreateClientForSale } from "./client.service";
import { createHistory } from "./history.service";
import { HttpError } from "./errors.service";

/**
 * Génère une référence unique pour un devis (ex: DEV-2025-001)
 */
async function generateQuoteReference(date, businessId, session = null) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  
  const query = {
    business: businessId,
    reference: { $regex: `^DEV-${year}-${month}-` }
  };

  const lastQuote = await Quote.findOne(query)
    .sort({ reference: -1 })
    .session(session)
    .lean();

  let counter = 1;
  if (lastQuote?.reference) {
    const parts = lastQuote.reference.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      counter = lastNum + 1;
    }
  }

  const paddedCounter = String(counter).padStart(3, "0");
  return `DEV-${year}-${month}-${paddedCounter}`;
}

/**
 * Crée un devis (sans modifier le stock)
 */
export async function createQuote({ payload, user }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!payload.businessId) {
      throw new HttpError(400, "ID de la boutique manquant.");
    }

    const businessObjectId = new mongoose.Types.ObjectId(payload.businessId);

    // 1) Générer référence devis
    const now = new Date(payload.quoteDate || Date.now());
    const reference = await generateQuoteReference(now, businessObjectId, session);

    // 2) Client (optionnel pour devis)
    const clientId = payload.client 
      ? await getOrCreateClientForSale(payload.client, businessObjectId, session) 
      : null;

    // 3) Calculer validité (par défaut 30 jours)
    const validUntil = payload.validUntil 
      ? new Date(payload.validUntil)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 4) Créer le devis
    const data = {
      business: businessObjectId,
      reference,
      client: clientId,
      items: payload.items,
      quoteDate: now,
      validUntil,
      remise: payload.remise || 0,
      total: Number(payload.total),
      notes: payload.notes || "",
      status: "sent",
      createdBy: user?.id,
    };

    const [quote] = await Quote.create([data], { session });

    // ✅ Populate les produits pour retourner les noms
    await quote.populate("items.product", "nom reference prixVente");
    await quote.populate("client", "nomComplet tel email adresse");
    await quote.populate("createdBy", "nom prenom");

    // 5) History
    await createHistory({
      userId: user?.id,
      action: "create",
      resource: "quote",
      resourceId: quote._id,
      description: `Devis ${reference} créé pour un montant de ${payload.total} FCFA${clientId ? ` (Client: ${payload.client?.nomComplet || 'N/A'})` : ''}`,
      businessId: businessObjectId
    }, session);

    await session.commitTransaction();
    session.endSession();

    return quote;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err.status && err.message) throw err;
    console.error("createQuote unexpected error:", err);
    throw new HttpError(500, "Erreur lors de la création du devis.");
  }
}

/**
 * Convertit un devis en vente
 */
export async function convertQuoteToSale({ quoteId, payments, status, user }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) Récupérer le devis
    const quote = await Quote.findById(quoteId)
      .populate("client")
      .populate("items.product")
      .session(session);

    if (!quote) {
      throw new HttpError(404, "Devis introuvable.");
    }

    if (quote.status === "converted") {
      throw new HttpError(400, "Ce devis a déjà été converti en vente.");
    }

    if (quote.status === "expired" || quote.status === "rejected") {
      throw new HttpError(400, "Ce devis ne peut plus être converti (expiré ou rejeté).");
    }

    // 2) Importer la fonction createSale
    const { createSale } = await import("./sale.service");

    // 3) Créer la vente avec les données du devis
    const salePayload = {
      businessId: quote.business.toString(),
      client: quote.client ? {
        _id: quote.client._id,
        nomComplet: quote.client.nomComplet,
        tel: quote.client.tel,
        email: quote.client.email,
        adresse: quote.client.adresse
      } : null,
      items: quote.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price
      })),
      dateExacte: new Date(),
      remise: quote.remise,
      total: quote.total,
      status: status || "pending",
      payments: payments || []
    };

    const sale = await createSale({ payload: salePayload, user });

    // 4) Marquer le devis comme converti
    quote.status = "converted";
    quote.convertedToSale = sale._id;
    await quote.save({ session });

    // 5) History
    await createHistory({
      userId: user?.id,
      action: "convert",
      resource: "quote",
      resourceId: quote._id,
      description: `Devis ${quote.reference} converti en vente ${sale.reference}`,
      businessId: quote.business
    }, session);

    await session.commitTransaction();
    session.endSession();

    return { quote, sale };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err.status && err.message) throw err;
    console.error("convertQuoteToSale unexpected error:", err);
    throw new HttpError(500, "Erreur lors de la conversion du devis.");
  }
}