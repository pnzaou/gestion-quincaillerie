import mongoose from "mongoose";

const ClientAccountSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, unique: true}, // un seul compte par client
  balance: { type: Number, required: true, default: 0 }, // solde actuel
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true, // createdAt, updatedAt auto
});

export default mongoose.models.ClientAccount || mongoose.model("ClientAccount", ClientAccountSchema);
