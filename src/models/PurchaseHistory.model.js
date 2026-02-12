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

  source: {
    type: String,
    enum: ['order', 'transfer', 'manual'],
    default: 'order'
  },
  
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Order", 
    required: false 
  },
  
  transfer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StockTransfer",
    required: false
  },
  
  supplier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Supplier",
    required: false
  },
  
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalCost: { type: Number, required: true },
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
purchaseHistorySchema.index({ transfer: 1 });
purchaseHistorySchema.index({ source: 1 });

const PurchaseHistory = mongoose.models.PurchaseHistory || 
mongoose.model("PurchaseHistory", purchaseHistorySchema);

export default PurchaseHistory;