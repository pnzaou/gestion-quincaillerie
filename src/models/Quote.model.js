import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: false },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      }
    ],
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

const Quote = mongoose.models.Quote || mongoose.model("Quote", quoteSchema)

export default Quote
