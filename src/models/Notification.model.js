import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  business: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Business", 
    required: true,
    index: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ["stock_alert", "stock_out", "low_stock", "order_received", "payment_received", "system"], 
    required: true,
    index: true
  },
  priority: { 
    type: String, 
    enum: ["low", "medium", "high", "urgent"], 
    default: "medium" 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedResource: {
    resourceType: { 
      type: String, 
      enum: ["product", "sale", "order", "payment", "client"], 
      required: false 
    },
    resourceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: false 
    }
  },
  isRead: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  readAt: { 
    type: Date, 
    required: false 
  },
  metadata: {
    productName: { type: String },
    currentStock: { type: Number },
    alertThreshold: { type: Number },
    saleReference: { type: String }
  }
}, {
  timestamps: true
});

// Index composés pour queries fréquentes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ business: 1, type: 1, createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;