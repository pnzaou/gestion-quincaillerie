import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    reference: { type: String, unique: true, required: true },
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

SaleSchema.index({ status: 1 })
SaleSchema.index({ dateExacte: 1 })
SaleSchema.index({ paymentMethod: 1 })
SaleSchema.index({ vendeur: 1 })
SaleSchema.index({ client: 1 })
SaleSchema.index({ vendeur: 1, dateExacte: 1 })

const Sale = mongoose.models.Sale || mongoose.model("Sale", SaleSchema)
export default Sale
