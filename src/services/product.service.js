// /services/product.service.js
import Product from "@/models/Product.model";
import mongoose from "mongoose";
import { HttpError } from "./errors.service";

export async function validateAndUpdateProductsForSale(items, session = null) {
  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.product)) {
      throw new HttpError(400, "Veuillez fournir un ID de produit valide.");
    }

    const prod = await Product.findById(item.product).session(session);
    if (!prod) throw new HttpError(400, `Produit introuvable pour l'ID ${item.product}.`);

    prod.QteStock -= item.quantity;
    if (prod.QteStock < 0) {
      throw new HttpError(400, `Quantité en stock insuffisante pour le produit : ${prod.nom}`);
    }

    await prod.save({ session });
  }
}
