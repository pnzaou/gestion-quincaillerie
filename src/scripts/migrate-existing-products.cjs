
import dbConnection from "../lib/db.js";
import Product from "../models/Product.model.js";
import PurchaseHistory from "../models/PurchaseHistory.model.js";
const mongoose = require("mongoose");

/**
 * Script de migration pour créer des entrées PurchaseHistory 
 * pour tous les produits existants qui ont un stock initial
 */
async function migrateExistingProducts() {
  try {
    await dbConnection();
    console.log("✅ Connexion à la base de données établie");

    // Récupérer tous les produits avec QteInitial > 0
    const products = await Product.find({ QteInitial: { $gt: 0 } });
    console.log(`📦 ${products.length} produits trouvés avec stock initial`);

    let migrated = 0;
    let skipped = 0;

    for (const product of products) {
      // Vérifier si une entrée existe déjà
      const existingEntry = await PurchaseHistory.findOne({
        product: product._id,
        business: product.business,
        notes: "Stock initial"
      });

      if (existingEntry) {
        console.log(`⏭️  Produit "${product.nom}" déjà migré, skip`);
        skipped++;
        continue;
      }

      // Créer l'entrée d'historique d'achat
      await PurchaseHistory.create({
        business: product.business,
        product: product._id,
        order: null,
        supplier: product.supplier_id || null,
        quantity: product.QteInitial,
        unitPrice: product.prixAchatEnGros,
        totalCost: product.QteInitial * product.prixAchatEnGros,
        receivedDate: product.createdAt || new Date(),
        receivedBy: null, // On ne sait pas qui a créé le produit
        notes: "Stock initial (migration)"
      });

      console.log(`✅ Produit "${product.nom}" migré (${product.QteInitial} unités à ${product.prixAchatEnGros} FCFA)`);
      migrated++;
    }

    console.log("\n🎉 Migration terminée !");
    console.log(`   - ${migrated} produits migrés`);
    console.log(`   - ${skipped} produits déjà migrés (skipped)`);

    await mongoose.connection.close();
    console.log("✅ Connexion fermée");
    process.exit(0);

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateExistingProducts();