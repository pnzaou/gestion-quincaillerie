import mongoose from "mongoose";
import { customAlphabet } from "nanoid"
const nanoid = customAlphabet("0123456789ABCDEFGH", 12);

const ClientAccountSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  accountNumber: { type: String, required: true, default: () => `ACCT-${nanoid()}` },
  balance: { type: Number, required: true, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Index unique pour client par boutique (un seul compte par client par boutique)
ClientAccountSchema.index({ client: 1, business: 1 }, { unique: true })

// Index unique global pour accountNumber (les numéros de compte sont uniques globalement)
ClientAccountSchema.index({ accountNumber: 1 }, { unique: true })

export default mongoose.models.ClientAccount || mongoose.model("ClientAccount", ClientAccountSchema);