import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    nomComplet: { type: String, required: true },
    tel: { type: String, required: true },
    email: { type: String, required: false },
    adresse: { type: String, required: false },
}, {
    timestamps: true
});

// Index unique pour téléphone par boutique
ClientSchema.index({ tel: 1, business: 1 }, { unique: true })

// Index unique partiel pour email par boutique (ignore les null/undefined)
ClientSchema.index(
    { email: 1, business: 1 }, 
    { 
        unique: true, 
        sparse: true,
        partialFilterExpression: { email: { $type: "string" } }
    }
)

const Client = mongoose.models.Client || mongoose.model("Client", ClientSchema);

export default Client;