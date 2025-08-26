import Client from "@/models/Client.model";
import { HttpError } from "./errors.service";

export async function getOrCreateClientForSale(clientData, session = null) {
  if (!clientData) return null;

  if (clientData._id) {
    return clientData._id;
  }

  const nomComplet = String(clientData.nomComplet || "").trim();
  const tel = String(clientData.tel || "").trim();
  const email = clientData.email ? String(clientData.email).trim() : null;
  const adresse = clientData.adresse ? String(clientData.adresse).trim() : null;

  if (!nomComplet || !tel) {
    throw new HttpError(400, "Le nom et le numéro de téléphone du client sont obligatoires.");
  }

  if (email) {
    const existingEmail = await Client.findOne({ email }).session(session);
    if (existingEmail) throw new HttpError(400, "L'email du client est déjà utilisé.");
  }

  const existingTel = await Client.findOne({ tel }).session(session);
  if (existingTel) throw new HttpError(400, "Le numéro de téléphone du client est déjà utilisé.");

  const [newClient] = await Client.create([{
    nomComplet, tel, email, adresse
  }], { session });

  return newClient._id;
}
