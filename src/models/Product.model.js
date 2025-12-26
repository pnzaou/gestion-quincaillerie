import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    nom: { type: String, required: true },
    prixAchat: { type: Number, required: true }, // ✅ Renommé (était prixAchatEnGros)
    prixVente: { type: Number, required: true }, // ✅ Renommé (était prixVenteEnGros)
    QteInitial: { type: Number, required: true, default: 0 },
    QteStock: { type: Number, required: true, default: 0 },
    QteAlerte: { type: Number, required: true, default: 0 },
    image: { type: String, required: false },
    reference: { type: String, required: false },
    description: { type: String },
    statut: { type: String,  enum: ["En stock", "En rupture"], default: "En stock", required: false },
    dateExpiration: { type: Date, required: false },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: false },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: false },
}, {
    timestamps: true
})

// Index unique pour nom par boutique
productSchema.index({ nom: 1, business: 1 }, { unique: true })

// Index unique partiel pour reference par boutique (si fournie)
productSchema.index(
    { reference: 1, business: 1 }, 
    { 
        unique: true, 
        sparse: true,
        partialFilterExpression: { reference: { $type: "string" } }
    }
)

const Product = mongoose.models.Product || mongoose.model("Product", productSchema)

export default Product