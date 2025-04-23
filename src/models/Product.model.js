import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    nom: {type: String, required: true, unique: true},
    prixAchat: {type: Number, required: true},
    prixVente: {type: Number, required: true},
    Qte: {type: Number, required: true, default: 0},
    QteAlerte: {type: Number, required: true, default: 0},
    image: {type: String, required: false},
    reference: {type: String, required: false},
    description: {type: String},
    dateExpiration: {type: Date, required: false},
    category_id: {type: mongoose.Schema.Types.ObjectId, ref: "Category", required: false},
    supplier_id: {type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: false},
}, {
    timestamps: true
})

const Product = mongoose.models.Product || mongoose.model("Product", productSchema)

export default Product