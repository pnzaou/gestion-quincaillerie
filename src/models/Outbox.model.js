import mongoose from "mongoose";

const OutboxSchema = new mongoose.Schema({
    type: {type: String, required: true},
    payload: {type: mongoose.Schema.Types.Mixed, required: true},
    processed: {type: Boolean, default: false},
    processedAt: {type: Date, default: null},
}, { timestamps: true  })

const Outbox = mongoose.models.Outbox || mongoose.model("Outbox", OutboxSchema)

export default Outbox