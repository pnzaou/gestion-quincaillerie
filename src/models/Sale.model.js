import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
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
    remisse: { type: Number, required: false },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["espèce", "carte de crédit", "Wave", "Orange Money", "Free Money"], required: true },
    vendeur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Sale = mongoose.models.Sale || mongoose.model("Sale", SaleSchema)

export default Sale
