import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    nomComplet: {type: String, required: true},
    tel: {type: String, required: true, unique: true},
    email: {type: String, required: false, unique: true},
    adresse: {type: String, required: false},
}, {
    timestamps: true
})

const Client = mongoose.models.Client || mongoose.model("Client", ClientSchema)

export default Client 