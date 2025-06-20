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
    price: {
        type: Number,
        required: true
    }
}, { _id: false })

const orderSchema = new mongoose.Schema({
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
    expectedDelivery: {type: Date, required: false},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: String
}, {
    timestamps: true
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default Order
