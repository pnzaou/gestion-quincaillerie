import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
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
  // Prix d'achat
  prixAchatEnGros: { type: Number, required: true },
  prixAchatDetail: { type: Number },
  // Prix de vente
  prixVenteEnGros: { type: Number, required: true },
  prixVenteDetail: { type: Number },
  // Période de validité
  validFrom: { type: Date, required: true, default: Date.now },
  validUntil: { type: Date }, // null = toujours valide
  // Raison du changement
  reason: { 
    type: String, 
    enum: ["initial", "supplier_increase", "supplier_decrease", "manual_update"],
    default: "manual_update"
  },
  notes: String,
  // Qui a fait le changement
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }
}, {
  timestamps: true
});

// Index pour récupérer rapidement l'historique d'un produit
priceHistorySchema.index({ product: 1, validFrom: -1 });
priceHistorySchema.index({ business: 1, product: 1 });

const PriceHistory = mongoose.models.PriceHistory || 
  mongoose.model("PriceHistory", priceHistorySchema);

export default PriceHistory;