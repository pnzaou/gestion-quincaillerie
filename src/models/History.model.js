import mongoose from "mongoose"

const HistorySchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actions: {
        type: String,
        required: true,
        enum: ["read", "create", "update", "delete", "login", "logout", "download"]
    },
    resource: { type: String, required: false },
    resourceId: { type: String, required: false },
    description: { type: String, required: false },
}, { timestamps: true })

const History = mongoose.models.History || mongoose.model("History", HistorySchema)

export default History 