import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    globalReference: { type: String, required: false, trim: true, uppercase: true, },
    nom: { type: String, required: true },
    prixAchat: { type: Number, required: true },
    prixVente: { type: Number, required: true },
    QteInitial: { type: Number, required: true, default: 0 },
    QteStock: { type: Number, required: true, default: 0 },
    QteAlerte: { type: Number, required: true, default: 0 },
    image: { type: String, required: false },
    reference: { type: String, required: false },
    description: { type: String },
    statut: { type: String, enum: ["En stock", "En rupture"], default: "En stock", required: false },
    dateExpiration: { type: Date, required: false },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: false },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: false },
}, {
    timestamps: true
})

// ✅ Middleware pour arrondir avant sauvegarde
productSchema.pre('save', function(next) {
  this.QteInitial = Math.round(this.QteInitial * 100) / 100;
  this.QteStock = Math.round(this.QteStock * 100) / 100;
  this.QteAlerte = Math.round(this.QteAlerte * 100) / 100;
  this.prixAchat = Math.round(this.prixAchat * 100) / 100;
  this.prixVente = Math.round(this.prixVente * 100) / 100;
  
  next();
});

// Index unique pour nom par boutique
productSchema.index({ nom: 1, business: 1 }, { unique: true })

// ✅ NOUVEAU : Index unique pour globalReference (si fournie)
productSchema.index(
    { globalReference: 1 }, 
    { 
        unique: true, 
        sparse: true,
        partialFilterExpression: { 
            globalReference: { $type: "string", $ne: "" } 
        }
    }
)

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