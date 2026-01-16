import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  business: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Business", 
    required: true,
    index: true 
  },
  
  // Identification
  reference: { 
    type: String, 
    required: true 
  }, // RAP-2025-01-001
  
  type: { 
    type: String, 
    enum: ["daily", "weekly", "monthly", "quarterly", "yearly", "custom"],
    required: true,
    index: true
  },
  
  // Période
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date, required: true },
  
  // Données agrégées
  data: {
    // Ventes
    sales: {
      totalRevenue: { type: Number, default: 0 },          // CA total
      totalSales: { type: Number, default: 0 },            // Nombre ventes
      averageSale: { type: Number, default: 0 },           // Panier moyen
      discount: { type: Number, default: 0 },              // Remises totales
      
      byStatus: {
        paid: { 
          count: { type: Number, default: 0 }, 
          amount: { type: Number, default: 0 } 
        },
        pending: { 
          count: { type: Number, default: 0 }, 
          amount: { type: Number, default: 0 } 
        },
        partial: { 
          count: { type: Number, default: 0 }, 
          amount: { type: Number, default: 0 } 
        },
        cancelled: { 
          count: { type: Number, default: 0 }, 
          amount: { type: Number, default: 0 } 
        }
      },
      
      byPaymentMethod: [{
        method: String,
        count: { type: Number, default: 0 },
        amount: { type: Number, default: 0 }
      }],
      
      topProducts: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: String,
        quantity: Number,
        revenue: Number,
        profit: Number
      }],
      
      topSellers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: String,
        salesCount: Number,
        revenue: Number
      }]
    },
    
    // Stock
    inventory: {
      totalValue: { type: Number, default: 0 },            // Valeur stock (prix achat × qté)
      totalProducts: { type: Number, default: 0 },
      outOfStock: { type: Number, default: 0 },
      lowStock: { type: Number, default: 0 },
      
      movements: {
        entries: { type: Number, default: 0 },             // Entrées (commandes reçues)
        exits: { type: Number, default: 0 }                // Sorties (ventes)
      },
      
      topValueProducts: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: String,
        quantity: Number,
        unitPrice: Number,
        totalValue: Number
      }]
    },
    
    // Clients
    clients: {
      totalClients: { type: Number, default: 0 },
      newClients: { type: Number, default: 0 },            // Période
      activeClients: { type: Number, default: 0 },         // Ayant acheté période
      totalDebt: { type: Number, default: 0 },             // Dettes totales (amountDue)
      
      topClients: [{
        client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
        clientName: String,
        revenue: Number,
        purchaseCount: Number,
        debt: Number
      }],
      
      accounts: {
        totalBalance: { type: Number, default: 0 },        // Solde total comptes clients
        activeAccounts: { type: Number, default: 0 }
      }
    },
    
    // Commandes fournisseurs
    orders: {
      totalOrders: { type: Number, default: 0 },
      estimatedTotal: { type: Number, default: 0 },
      actualTotal: { type: Number, default: 0 },
      priceVariance: { type: Number, default: 0 },         // Écart estimé vs réel
      
      byStatus: {
        sent: { type: Number, default: 0 },
        confirmed: { type: Number, default: 0 },
        partially_received: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        cancelled: { type: Number, default: 0 }
      },
      
      topSuppliers: [{
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
        supplierName: String,
        ordersCount: Number,
        totalAmount: Number
      }]
    },
    
    // Finances
    finances: {
      grossProfit: { type: Number, default: 0 },          // Marge brute (vente - achat)
      profitMargin: { type: Number, default: 0 },         // % marge
      cashReceived: { type: Number, default: 0 },         // Encaissements réels
      creditSales: { type: Number, default: 0 },          // Ventes à crédit (pending + partial)
      
      cashFlow: {
        inflows: { type: Number, default: 0 },            // Encaissements
        outflows: { type: Number, default: 0 }            // Décaissements (commandes payées)
      }
    },
    
    // Catégories
    categories: [{
      category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      categoryName: String,
      revenue: Number,
      quantity: Number,
      profitMargin: Number,
      productsCount: Number
    }]
  },
  
  // Métadonnées
  generatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  generatedAt: { type: Date, default: Date.now },
  
  status: { 
    type: String, 
    enum: ["draft", "finalized", "archived"],
    default: "finalized",
    index: true
  },
  
  notes: String,
  
  // Comparaison période précédente
  comparison: {
    previousPeriod: {
      startDate: Date,
      endDate: Date
    },
    changes: {
      revenue: { 
        value: { type: Number, default: 0 }, 
        percentage: { type: Number, default: 0 } 
      },
      sales: { 
        value: { type: Number, default: 0 }, 
        percentage: { type: Number, default: 0 } 
      },
      clients: { 
        value: { type: Number, default: 0 }, 
        percentage: { type: Number, default: 0 } 
      },
      profitMargin: { 
        value: { type: Number, default: 0 }, 
        percentage: { type: Number, default: 0 } 
      },
      inventory: { 
        value: { type: Number, default: 0 }, 
        percentage: { type: Number, default: 0 } 
      }
    }
  }
  
}, { timestamps: true });

// Index unique pour reference par boutique
reportSchema.index({ reference: 1, business: 1 }, { unique: true });

// Index composés pour performance
reportSchema.index({ business: 1, type: 1, startDate: -1 });
reportSchema.index({ business: 1, generatedAt: -1 });
reportSchema.index({ business: 1, status: 1, type: 1 });

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;