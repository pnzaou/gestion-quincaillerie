// /services/product.service.js
import Product from "@/models/Product.model";
import mongoose from "mongoose";
import { HttpError } from "./errors.service";

export async function validateAndUpdateProductsForSale(items, businessId, session = null) {
  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.product)) {
      throw new HttpError(400, "Veuillez fournir un ID de produit valide.");
    }

    const prod = await Product.findOne({ _id: item.product, business: businessId }).session(session);
    if (!prod) {
      throw new HttpError(400, `Produit introuvable pour l'ID ${item.product} dans cette boutique.`);
    }

    if (prod.QteStock < item.quantity) {
      throw new HttpError(
        400, 
        `Stock insuffisant pour le produit : ${prod.nom}. Disponible: ${prod.QteStock}, Demandé: ${item.quantity}`
      );
    }

    prod.QteStock -= item.quantity;

    if (prod.QteStock === 0) {
      prod.statut = "En rupture";
    }

    if (prod.QteStock < 0) {
      throw new HttpError(400, `Quantité en stock insuffisante pour le produit : ${prod.nom}`);
    }

    await prod.save({ session });
  }
}
