import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    sale: { type: mongoose.Schema.Types.ObjectId, ref: "Sale", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["espèce","carte de crédit","Wave","Orange Money","Free Money"] }
}, { timestamps: true })

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema)
export default Payment
