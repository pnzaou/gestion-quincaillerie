import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
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
    // Prix ESTIMÉ lors de la commande (pour budgétisation)
    estimatedPrice: {
        type: Number,
        required: true
    },
    // Prix RÉEL à la réception (peut différer de l'estimé)
    actualPrice: {
        type: Number,
        default: null // null tant que pas reçu
    },
    receivedQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'partially_received', 'received'],
        default: 'pending'
    },
    // Historique des réceptions pour ce produit dans cette commande
    receptions: [{
        date: { type: Date, required: true },
        quantity: { type: Number, required: true },
        actualPrice: { type: Number, required: true }, // Prix unitaire réel à cette réception
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: String
    }]
}, { _id: false })

const orderSchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
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
    // Totaux
    estimatedTotal: { type: Number, required: true }, // Total estimé
    actualTotal: { type: Number, default: 0 }, // Total réel (calculé à la réception)
    // Écart entre estimé et réel
    priceVariance: { type: Number, default: 0 }, // actualTotal - estimatedTotal
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: String
}, {
    timestamps: true
})

// Index unique pour reference par boutique
orderSchema.index({ reference: 1, business: 1 }, { unique: true })
orderSchema.index({ business: 1, status: 1 })
orderSchema.index({ business: 1, orderDate: 1 })
orderSchema.index({ supplier: 1 })

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default Order