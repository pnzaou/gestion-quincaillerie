import mongoose from "mongoose";

const AccountTransactionSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "ClientAccount", required: true },
  type: { type: String, enum: ["deposit", "withdrawal", "adjustment", "refund"], required: true },
  amount: { type: Number, required: true, min: 0 },
  balanceAfter: { type: Number, required: true }, // solde du compte après cette transaction
  reference: { type: String }, // ex : ID de la vente, référence externe
  description: { type: String }, // ex : "Achat d'article X", "Dépôt initial"
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export default mongoose.models.AccountTransaction || mongoose.model("AccountTransaction", AccountTransactionSchema);