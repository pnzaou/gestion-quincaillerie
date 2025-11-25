import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: false },
    website: { type: String, required: false },
})

export default mongoose.models.Business || mongoose.model("Business", BusinessSchema);