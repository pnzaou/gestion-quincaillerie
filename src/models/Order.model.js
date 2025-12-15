import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    // ❌ RETIRER business d'ici
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    receivedQuantity: { // Pour gérer les réceptions partielles
        type: Number,
        default: 0,
        min: 0
    },
    status: { // Statut par produit
        type: String,
        enum: ['pending', 'partially_received', 'received'],
        default: 'pending'
    }
}, { _id: false })

const orderSchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true }, // ✅ business au niveau Order
    reference: { type: String, required: true },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        default: null
    },
    items: {
        type: [orderItemSchema],
        validate: items => items.length > 0
    },
    status: {
        type: String,
        enum: ['draft','sent','confirmed','partially_received','completed','cancelled'],
        default: 'draft'
    },
    orderDate: { type: Date, required: true, default: () => new Date() },
    expectedDelivery: { type: Date, required: false },
    receivedDate: { type: Date, required: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: String,
    total: { type: Number, required: true }
}, {
    timestamps: true
})

// Index unique pour reference par boutique
orderSchema.index({ reference: 1, business: 1 }, { unique: true })

// Index de performance
orderSchema.index({ business: 1, status: 1 })
orderSchema.index({ business: 1, orderDate: 1 })
orderSchema.index({ supplier: 1 })

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default Order