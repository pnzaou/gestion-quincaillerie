import Client from "@/models/Client.model";
import mongoose from "mongoose";
import { HttpError } from "./errors.service";

export async function getOrCreateClientForSale(clientData, businessId, session = null) {
  if (!clientData) return null;

  // Si c'est un ID (string MongoDB), on le retourne directement
  if (typeof clientData === 'string' && mongoose.Types.ObjectId.isValid(clientData)) {
    return new mongoose.Types.ObjectId(clientData);
  }

  if (clientData._id) {
    return new mongoose.Types.ObjectId(clientData._id);
  }

  const nomComplet = String(clientData.nomComplet || "").trim();
  const tel = String(clientData.tel || "").trim();
  const email = clientData.email ? String(clientData.email).trim() : null;
  const adresse = clientData.adresse ? String(clientData.adresse).trim() : null;

  if (!nomComplet || !tel) {
    throw new HttpError(400, "Le nom et le numéro de téléphone du client sont obligatoires.");
  }

  if (email) {
    const existingEmail = await Client.findOne({ 
      email, 
      business: businessId 
    }).session(session);
    
    if (existingEmail) {
      throw new HttpError(400, "L'email du client est déjà utilisé dans cette boutique.");
    }
  }

  const existingTel = await Client.findOne({ tel, business: businessId }).session(session);
  if (existingTel) throw new HttpError(400, "Le numéro de téléphone du client est déjà utilisé.");

  const [newClient] = await Client.create([{
    business: businessId,
    nomComplet,
    tel,
    email: email || undefined, // undefined pour ne pas créer le champ si vide
    adresse: adresse || undefined
  }], { session });

  return newClient._id;
}
