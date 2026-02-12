import mongoose from "mongoose";

const transferItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    // Référence au produit dans la boutique source
    sourceProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    // Référence au produit dans la boutique destination (peut être différent si produits distincts)
    destinationProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0.01 // ✅ Support quantités décimales
    },
    // Prix de transfert (peut être différent du prix d'achat original)
    transferPrice: {
        type: Number,
        required: true,
        min: 0
    },
    // Prix d'achat original dans la boutique source (pour traçabilité)
    originalPurchasePrice: {
        type: Number,
        required: true
    },
    // Notes spécifiques à cet item
    notes: String
}, { _id: false });

const stockTransferSchema = new mongoose.Schema({
    // Référence unique du transfert
    reference: {
        type: String,
        required: true,
        unique: true
    },
    
    // Boutique source (qui envoie)
    sourceBusiness: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },
    
    // Boutique destination (qui reçoit)
    destinationBusiness: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },
    
    // Référence de la commande source (si le transfert vient d'une commande)
    sourceOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null
    },
    
    // Commande automatiquement créée dans la boutique destination
    destinationOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null
    },
    
    // Articles transférés
    items: {
        type: [transferItemSchema],
        validate: items => items.length > 0
    },
    
    // Statut du transfert
    status: {
        type: String,
        enum: [
            'pending',           // En attente de validation
            'validated',         // Validé par source, en transit
            'received',          // Reçu par destination
            'partially_received', // Partiellement reçu
            'cancelled'          // Annulé
        ],
        default: 'pending'
    },
    
    // Dates
    transferDate: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    expectedArrival: {
        type: Date,
        required: false
    },
    receivedDate: {
        type: Date,
        required: false
    },
    
    // Total du transfert (basé sur transferPrice)
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Utilisateurs impliqués
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    
    // Notes générales
    notes: String,
    
    // Métadonnées
    metadata: {
        // Raison du transfert
        reason: {
            type: String,
            enum: ['order_split', 'rebalancing', 'other'],
            default: 'other'
        },
        // Informations additionnelles
        additionalInfo: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// ✅ Middleware pour arrondir avant sauvegarde
stockTransferSchema.pre('save', function(next) {
    // Arrondir les quantités des items
    this.items = this.items.map(item => ({
        ...item,
        quantity: Math.round(item.quantity * 100) / 100,
        transferPrice: Math.round(item.transferPrice * 100) / 100,
        originalPurchasePrice: Math.round(item.originalPurchasePrice * 100) / 100
    }));
    
    // Arrondir le total
    this.totalAmount = Math.round(this.totalAmount * 100) / 100;
    
    next();
});

// Index
stockTransferSchema.index({ reference: 1 }, { unique: true });
stockTransferSchema.index({ sourceBusiness: 1, status: 1 });
stockTransferSchema.index({ destinationBusiness: 1, status: 1 });
stockTransferSchema.index({ transferDate: 1 });
stockTransferSchema.index({ sourceOrder: 1 });

const StockTransfer = mongoose.models.StockTransfer || mongoose.model('StockTransfer', stockTransferSchema);

export default StockTransfer;