import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    reference: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: false },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      }
    ],
    dateExacte: { type: Date, required: true },
    remise: { type: Number, required: false },
    total: { type: Number, required: true },
    vendeur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["paid", "pending", "partial", "cancelled"], required: true },
    amountDue: { type: Number, required: false },
  },
  { timestamps: true }
);

// ✅ NOUVEAU : Middleware pour arrondir avant sauvegarde
SaleSchema.pre('save', function(next) {
  // Arrondir les quantités et prix des items
  this.items = this.items.map(item => ({
    ...item,
    quantity: Math.round(item.quantity * 100) / 100,
    price: Math.round(item.price * 100) / 100
  }));
  
  // Arrondir les montants
  if (this.remise) this.remise = Math.round(this.remise * 100) / 100;
  this.total = Math.round(this.total * 100) / 100;
  if (this.amountDue) this.amountDue = Math.round(this.amountDue * 100) / 100;
  
  next();
});

// Index unique pour reference par boutique
SaleSchema.index({ reference: 1, business: 1 }, { unique: true })

// Index de performance
SaleSchema.index({ status: 1 })
SaleSchema.index({ dateExacte: 1 })
SaleSchema.index({ vendeur: 1 })
SaleSchema.index({ client: 1 })
SaleSchema.index({ vendeur: 1, dateExacte: 1 })
SaleSchema.index({ business: 1, dateExacte: 1 })

const Sale = mongoose.models.Sale || mongoose.model("Sale", SaleSchema)
export default Sale