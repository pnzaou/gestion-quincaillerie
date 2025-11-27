import mongoose from "mongoose";
import { customAlphabet } from "nanoid"
const nanoid = customAlphabet("0123456789ABCDEFGH", 12);

const ClientAccountSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, unique: true}, // un seul compte par client
  accountNumber: { type: String, required: true, unique: true, default: () => `ACCT-${nanoid()}` }, // numéro de compte unique
  balance: { type: Number, required: true, default: 0 }, // solde actuel
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true, // createdAt, updatedAt auto
});

export default mongoose.models.ClientAccount || mongoose.model("ClientAccount", ClientAccountSchema);
