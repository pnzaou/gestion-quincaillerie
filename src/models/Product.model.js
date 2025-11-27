import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    nom: {type: String, required: true, unique: true},
    prixAchatEnGros: {type: Number, required: true},
    prixVenteEnGros: {type: Number, required: true},
    prixAchatDetail: {type: Number, required: false},
    prixVenteDetail: {type: Number, required: false},
    QteInitial: {type: Number, required: true, default: 0},
    QteStock: {type: Number, required: true, default: 0},
    QteAlerte: {type: Number, required: true, default: 0},
    image: {type: String, required: false},
    reference: {type: String, required: false},
    description: {type: String},
    statut: {type: String,  enum: ["En stock", "En rupture"], default: "En stock", required: false},
    dateExpiration: {type: Date, required: false},
    category_id: {type: mongoose.Schema.Types.ObjectId, ref: "Category", required: false},
    supplier_id: {type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: false},
}, {
    timestamps: true
})

const Product = mongoose.models.Product || mongoose.model("Product", productSchema)

export default Product