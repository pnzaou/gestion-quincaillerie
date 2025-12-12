import Client from "@/models/Client.model";
import { HttpError } from "./errors.service";
import mongoose from "mongoose";
import AccountTransactionModel from "@/models/AccountTransaction.model";
import ClientAccountModel from "@/models/ClientAccount.model";

export async function getAccountByClientId(clientId, session = null) {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new HttpError(400, "clientId invalide");
  }
  return ClientAccountModel.findOne({ client: clientId }).session(session);
}

export async function ensureAccountForClient(clientId, businessId, session = null) {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new HttpError(400, "clientId invalide");
  }

  if (!mongoose.Types.ObjectId.isValid(businessId)) {
    throw new HttpError(400, "businessId invalide");
  }

  const businessObjectId = new mongoose.Types.ObjectId(businessId);

  // ✅ On utilise upsert pour créer le compte si absent avec businessId
  const account = await ClientAccountModel.findOneAndUpdate(
    { client: clientId, business: businessObjectId },
    { 
      $setOnInsert: { 
        client: clientId, 
        business: businessObjectId, // ✅ Ajout du business
        balance: 0, 
        lastUpdated: new Date() 
      } 
    },
    { new: true, upsert: true, session }
  );

  return account;
}

/**
 * Déposer de l'argent sur le compte client.
 * Retourne { account, transaction }.
*/
export async function deposit(clientId, amount, {
  session = null,
  reference = null,
  description = "Dépôt",
  createdBy = null,
  businessId = null, // ✅ Ajout du businessId
  meta = {}
} = {}) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, "Le montant du dépôt doit être un nombre positif.");
  }

  // ✅ Vérifier businessId
  if (!businessId) {
    throw new HttpError(400, "businessId est requis pour le dépôt.");
  }

  const businessObjectId = new mongoose.Types.ObjectId(businessId);

  // vérifier que le client existe et appartient à cette boutique
  const client = await Client.findOne({ 
    _id: clientId, 
    business: businessObjectId 
  }).session(session);
  
  if (!client) {
    throw new HttpError(404, "Client introuvable dans cette boutique.");
  }

  // ✅ upsert + $inc atomique avec businessId
  const updatedAccount = await ClientAccountModel.findOneAndUpdate(
    { client: clientId, business: businessObjectId },
    {
      $inc: { balance: amount },
      $set: { lastUpdated: new Date() },
      $setOnInsert: { client: clientId, business: businessObjectId }
    },
    { new: true, upsert: true, session }
  );

  // ✅ créer la transaction avec businessId
  const trans = {
    business: businessObjectId, // ✅ Ajout du business
    account: updatedAccount._id,
    type: "deposit",
    amount: amount,
    balanceAfter: updatedAccount.balance,
    reference,
    description,
    createdAt: new Date(),
    meta: { ...meta, createdBy }
  };

  const [transaction] = await AccountTransactionModel.create([trans], { session });

  return { account: updatedAccount, transaction };
}

/**
 * Débiter le compte client pour une dépense (ex: utilisation lors d'une vente).
 * - refuse si solde insuffisant sauf si allowNegative = true
 * - effectue l'opération atomiquement en testant balance >= amount dans la requête
 * Retourne { account, transaction }.
*/
export async function debit(clientId, amount, {
  session = null,
  reference = null,
  description = "Retrait (vente)",
  relatedSaleId = null,
  allowNegative = false,
  createdBy = null,
  businessId = null, // ✅ Ajout du businessId (optionnel car peut venir du context)
  meta = {}
} = {}) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, "Le montant à débiter doit être un nombre positif.");
  }

  // Vérifier existence client/account
  const query = { client: clientId };
  if (businessId) {
    query.business = new mongoose.Types.ObjectId(businessId);
  }

  const account = await ClientAccountModel.findOne(query).session(session);
  if (!account) {
    throw new HttpError(404, "Compte client introuvable.");
  }

  let updatedAccount;
  if (allowNegative) {
    // simple décrément atomique (autorise solde négatif)
    updatedAccount = await ClientAccountModel.findOneAndUpdate(
      query,
      { $inc: { balance: -amount }, $set: { lastUpdated: new Date() } },
      { new: true, session }
    );
  } else {
    // décrément atomique seulement si balance >= amount
    updatedAccount = await ClientAccountModel.findOneAndUpdate(
      { ...query, balance: { $gte: amount } },
      { $inc: { balance: -amount }, $set: { lastUpdated: new Date() } },
      { new: true, session }
    );
    if (!updatedAccount) {
      throw new HttpError(400, "Solde du compte insuffisant.");
    }
  }

  // ✅ créer transaction ledger avec businessId
  const trans = {
    business: account.business, // ✅ Utiliser le business du compte
    account: updatedAccount._id,
    type: "withdrawal",
    amount: amount,
    balanceAfter: updatedAccount.balance,
    reference,
    description,
    createdAt: new Date(),
    meta: { ...meta, createdBy, relatedSaleId }
  };

  const [transaction] = await AccountTransactionModel.create([trans], { session });

  return { account: updatedAccount, transaction };
}

/**
 * Obtenir le solde courant
 */
export async function getBalance(clientId, session = null) {
  const account = await ClientAccountModel.findOne({ client: clientId }).session(session);
  return account ? account.balance : 0;
}

/**
 * Lister les transactions
*/
export async function listTransactions({ clientId, limit = 10, page = 1, session = null } = {}) {
  const account = await ClientAccountModel.findOne({ client: clientId }).session(session);
  if (!account) throw new HttpError(404, "Compte client introuvable.");

  const skip = (page - 1) * limit;
  const txs = await AccountTransactionModel.find({ account: account._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .session(session);

  return txs;
}