import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: false },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      }
    ],
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["espèce", "carte de crédit", "Wave", "Orange Money", "Free Money"], required: true },
    soldBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Sale = mongoose.models.Sale || mongoose.model("Sale", SaleSchema)

export default Sale
