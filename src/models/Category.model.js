import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    nom: {type: String, required: true, unique: true},
    description: {type: String}
}, {
    timestamps: true
})

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema)

export default Category