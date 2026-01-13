import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    business: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Business", 
      required: true,
      index: true 
    },
    reference: { 
      type: String, 
      required: true,
      index: true
    },
    client: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Client", 
      required: false 
    },
    items: [
      {
        product: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Product", 
          required: true 
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      }
    ],
    remise: { 
      type: Number, 
      default: 0 
    },
    total: { 
      type: Number, 
      required: true 
    },
    quoteDate: { 
      type: Date, 
      default: Date.now,
      required: true 
    },
    validUntil: { 
      type: Date, 
      required: false 
    },
    status: { 
      type: String, 
      enum: ["draft", "sent", "accepted", "rejected", "expired", "converted"], 
      default: "draft",
      index: true
    },
    notes: { 
      type: String, 
      required: false 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    },
    convertedToSale: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Sale", 
      required: false 
    },
  },
  { timestamps: true }
);

// Index unique pour référence par boutique
quoteSchema.index({ reference: 1, business: 1 }, { unique: true });

// Index de performance
quoteSchema.index({ status: 1, createdAt: -1 });
quoteSchema.index({ business: 1, createdAt: -1 });
quoteSchema.index({ client: 1 });
quoteSchema.index({ createdBy: 1, createdAt: -1 });

const Quote = mongoose.models.Quote || mongoose.model("Quote", quoteSchema);

export default Quote;