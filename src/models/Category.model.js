import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    nom: { type: String, required: true },
    description: { type: String }
}, {
    timestamps: true
})

// Index unique pour nom par boutique
categorySchema.index({ nom: 1, business: 1 }, { unique: true })

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema)

export default Category