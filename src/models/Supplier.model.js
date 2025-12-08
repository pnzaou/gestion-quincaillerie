import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    nom: {type: String, required: true},
    adresse: {type: String, required: false},
    telephone: {type: String, required: true},
    email: {type: String, required: false},
}, { timestamps: true })

// Index unique pour nom par boutique
supplierSchema.index({ nom: 1, business: 1 }, { unique: true })

// Index unique pour téléphone par boutique
supplierSchema.index({ telephone: 1, business: 1 }, { unique: true })

// Index unique partiel pour email (ignore les null/undefined)
supplierSchema.index(
    { email: 1, business: 1 }, 
    { 
        unique: true, 
        sparse: true,
        partialFilterExpression: { email: { $type: "string" } }
    }
)

const Supplier = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema)

export default Supplier