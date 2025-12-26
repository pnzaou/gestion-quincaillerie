import mongoose from "mongoose";

const purchaseHistorySchema = new mongoose.Schema({
  business: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Business", 
    required: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Order", 
    required: false 
  },
  supplier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Supplier"
  },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  // ❌ purchaseType supprimé
  receivedDate: { type: Date, required: true },
  receivedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  notes: String
}, {
  timestamps: true
});

purchaseHistorySchema.index({ business: 1, product: 1, receivedDate: -1 });
purchaseHistorySchema.index({ order: 1 });

const PurchaseHistory = mongoose.models.PurchaseHistory || 
  mongoose.model("PurchaseHistory", purchaseHistorySchema);

export default PurchaseHistory;