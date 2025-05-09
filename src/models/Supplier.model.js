import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    nom: {type: String, required: true, unique: true},
    adresse: {type: String, required: false},
    telephone: {type: String, required: true, unique: true},
    email: {type: String, required: false, unique: true},
}, { timestamps: true })

const Supplier = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema)

export default Supplier