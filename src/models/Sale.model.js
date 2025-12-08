import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    reference: { type: String, required: true }, // ❌ Retirer unique: true
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

// Index unique pour reference par boutique
SaleSchema.index({ reference: 1, business: 1 }, { unique: true })

// Index de performance
SaleSchema.index({ status: 1 })
SaleSchema.index({ dateExacte: 1 })
SaleSchema.index({ paymentMethod: 1 })
SaleSchema.index({ vendeur: 1 })
SaleSchema.index({ client: 1 })
SaleSchema.index({ vendeur: 1, dateExacte: 1 })
SaleSchema.index({ business: 1, dateExacte: 1 }) // Pour les requêtes du dashboard

const Sale = mongoose.models.Sale || mongoose.model("Sale", SaleSchema)
export default Sale