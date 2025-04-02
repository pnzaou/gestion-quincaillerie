import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    nom: {type: String, required: true, unique: true},
    prix: {type: Number, required: true},
    Qte: {type: Number, required: true, default: 0},
    fournisseur: {type: String, required: false},
    description: {type: String},
    category_id: {type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true}
}, {
    timestamps: true
})

const Product = mongoose.models.Product || mongoose.model("Product", productSchema)

export default Product