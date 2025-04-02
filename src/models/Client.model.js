import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    nomComplet: {type: String, required: true},
    tel: {type: String, required: true, unique: true},
}, {
    timestamps: true
})

const Client = mongoose.models.User || mongoose.model("Client", ClientSchema)

export default Client 