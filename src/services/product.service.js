// /services/product.service.js
import Product from "@/models/Product.model";
import mongoose from "mongoose";
import { HttpError } from "./errors.service";

export async function validateAndUpdateProductsForSale(items, businessId, session = null) {
  const updatedProducts = [];

  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.product)) {
      throw new HttpError(400, "Veuillez fournir un ID de produit valide.");
    }

    const prod = await Product.findOne({ _id: item.product, business: businessId }).session(session);
    if (!prod) {
      throw new HttpError(400, `Produit introuvable pour l'ID ${item.product} dans cette boutique.`);
    }

    // ✅ Arrondir la quantité à 2 décimales
    const quantity = Math.round(item.quantity * 100) / 100;
    const currentStock = Math.round(prod.QteStock * 100) / 100;

    // ✅ Calculer le nouveau stock (peut être négatif)
    const newStock = Math.round((currentStock - quantity) * 100) / 100;
    prod.QteStock = newStock;

    // ✅ Mettre à jour le statut selon le stock
    if (prod.QteStock <= 0) {
      prod.statut = "En rupture";
    } else {
      prod.statut = "En stock";
    }

    await prod.save({ session });

    updatedProducts.push({
      productId: item.product,
      newStock: prod.QteStock,
      alertThreshold: prod.QteAlerte
    });
  }

  return updatedProducts;
}