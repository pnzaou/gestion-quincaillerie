import mongoose from "mongoose";

/**
 * Enregistre chaque achat réel d'un produit avec son prix
 * Utilisé pour calculer les marges avec précision
 */
const purchaseHistorySchema = new mongoose.Schema({
  business: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Business", 
    required: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Order", 
    required: true 
  },
  supplier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Supplier"
  },
  // Détails de l'achat
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true }, // Prix unitaire RÉEL payé
  totalCost: { type: Number, required: true }, // quantity × unitPrice
  // Date de réception (pas de commande)
  receivedDate: { type: Date, required: true },
  receivedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  notes: String
}, {
  timestamps: true
});

// Index pour calculer rapidement le coût d'achat moyen
purchaseHistorySchema.index({ business: 1, product: 1, receivedDate: -1 });
purchaseHistorySchema.index({ order: 1 });

const PurchaseHistory = mongoose.models.PurchaseHistory || 
  mongoose.model("PurchaseHistory", purchaseHistorySchema);

export default PurchaseHistory;