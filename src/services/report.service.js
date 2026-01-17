import mongoose from "mongoose";
import Report from "@/models/Report.model";
import Sale from "@/models/Sale.model";
import Product from "@/models/Product.model";
import Client from "@/models/Client.model";
import ClientAccount from "@/models/ClientAccount.model";
import Order from "@/models/Order.model";
import Payment from "@/models/Payment.model";
import PurchaseHistory from "@/models/PurchaseHistory.model";
import { HttpError } from "./errors.service";
import { createHistory } from "./history.service";

/**
 * Génère une référence unique pour un rapport
 */
async function generateReportReference(date, businessId) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  
  const query = {
    business: businessId,
    reference: { $regex: `^RAP-${year}-${month}-` }
  };

  const lastReport = await Report.findOne(query)
    .sort({ reference: -1 })
    .lean();

  let counter = 1;
  if (lastReport?.reference) {
    const parts = lastReport.reference.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      counter = lastNum + 1;
    }
  }

  const paddedCounter = String(counter).padStart(3, "0");
  return `RAP-${year}-${month}-${paddedCounter}`;
}

/**
 * Calcule les dates de la période précédente pour comparaison
 */
function getPreviousPeriod(startDate, endDate) {
  const duration = endDate - startDate;
  const previousEnd = new Date(startDate.getTime() - 1); // Jour avant startDate
  const previousStart = new Date(previousEnd.getTime() - duration);
  
  return { 
    startDate: previousStart, 
    endDate: previousEnd 
  };
}

/**
 * Calcule le pourcentage de changement
 */
function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Agrège les données de ventes
 */
async function aggregateSalesData(businessId, startDate, endDate) {
  // Toutes les ventes de la période
  const sales = await Sale.find({
    business: businessId,
    dateExacte: { $gte: startDate, $lte: endDate }
  })
    .populate("items.product", "nom prixAchat")
    .populate("vendeur", "nom prenom")
    .lean();

  // Calculs de base
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalDiscount = sales.reduce((sum, sale) => sum + (sale.remise || 0), 0);
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Par statut
  const byStatus = {
    paid: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    partial: { count: 0, amount: 0 },
    cancelled: { count: 0, amount: 0 }
  };

  sales.forEach(sale => {
    if (byStatus[sale.status]) {
      byStatus[sale.status].count++;
      byStatus[sale.status].amount += sale.total;
    }
  });

  // Par méthode de paiement
  const payments = await Payment.find({
    business: businessId,
    createdAt: { $gte: startDate, $lte: endDate }
  }).lean();

  const paymentsByMethod = {};
  payments.forEach(payment => {
    if (!paymentsByMethod[payment.method]) {
      paymentsByMethod[payment.method] = { count: 0, amount: 0 };
    }
    paymentsByMethod[payment.method].count++;
    paymentsByMethod[payment.method].amount += payment.amount;
  });

  const byPaymentMethod = Object.entries(paymentsByMethod).map(([method, data]) => ({
    method,
    count: data.count,
    amount: data.amount
  }));

  // Top produits vendus
  const productSales = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const productId = item.product._id.toString();
      if (!productSales[productId]) {
        productSales[productId] = {
          product: item.product._id,
          productName: item.product.nom,
          quantity: 0,
          revenue: 0,
          cost: 0
        };
      }
      productSales[productId].quantity += item.quantity;
      productSales[productId].revenue += item.price * item.quantity;
      productSales[productId].cost += (item.product.prixAchat || 0) * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .map(p => ({ ...p, profit: p.revenue - p.cost }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Top vendeurs
  const sellerSales = {};
  sales.forEach(sale => {
    const sellerId = sale.vendeur?._id?.toString();
    if (sellerId) {
      if (!sellerSales[sellerId]) {
        sellerSales[sellerId] = {
          user: sale.vendeur._id,
          userName: `${sale.vendeur.prenom} ${sale.vendeur.nom}`,
          salesCount: 0,
          revenue: 0
        };
      }
      sellerSales[sellerId].salesCount++;
      sellerSales[sellerId].revenue += sale.total;
    }
  });

  const topSellers = Object.values(sellerSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    totalRevenue,
    totalSales,
    averageSale,
    discount: totalDiscount,
    byStatus,
    byPaymentMethod,
    topProducts,
    topSellers
  };
}

/**
 * Agrège les données de stock
 */
async function aggregateInventoryData(businessId) {
  const products = await Product.find({ business: businessId }).lean();

  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.QteStock === 0).length;
  const lowStock = products.filter(p => p.QteStock > 0 && p.QteStock <= p.QteAlerte).length;
  const totalValue = products.reduce((sum, p) => sum + (p.prixAchat * p.QteStock), 0);

  // Top produits par valeur stock
  const topValueProducts = products
    .map(p => ({
      product: p._id,
      productName: p.nom,
      quantity: p.QteStock,
      unitPrice: p.prixAchat,
      totalValue: p.prixAchat * p.QteStock
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10);

  return {
    totalValue,
    totalProducts,
    outOfStock,
    lowStock,
    movements: {
      entries: 0, // TODO: Calculer via PurchaseHistory
      exits: 0    // TODO: Calculer via Sales
    },
    topValueProducts
  };
}

/**
 * Agrège les données clients
 */
async function aggregateClientsData(businessId, startDate, endDate) {
  const allClients = await Client.find({ business: businessId }).lean();
  const totalClients = allClients.length;

  // Nouveaux clients de la période
  const newClients = await Client.countDocuments({
    business: businessId,
    createdAt: { $gte: startDate, $lte: endDate }
  });

  // Clients actifs (ayant acheté durant la période)
  const activeSales = await Sale.find({
    business: businessId,
    dateExacte: { $gte: startDate, $lte: endDate },
    client: { $ne: null }
  }).distinct("client");

  const activeClients = activeSales.length;

  // Dettes totales (amountDue)
  const salesWithDebt = await Sale.find({
    business: businessId,
    status: { $in: ["pending", "partial"] }
  }).lean();

  const totalDebt = salesWithDebt.reduce((sum, sale) => sum + (sale.amountDue || 0), 0);

  // Top clients
  const clientSales = await Sale.aggregate([
    {
      $match: {
        business: new mongoose.Types.ObjectId(businessId),
        dateExacte: { $gte: startDate, $lte: endDate },
        client: { $ne: null }
      }
    },
    {
      $group: {
        _id: "$client",
        revenue: { $sum: "$total" },
        purchaseCount: { $sum: 1 },
        debt: { $sum: "$amountDue" }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);

  const clientIds = clientSales.map(c => c._id);
  const clientsData = await Client.find({ _id: { $in: clientIds } }).lean();
  const clientsMap = Object.fromEntries(clientsData.map(c => [c._id.toString(), c]));

  const topClients = clientSales.map(c => ({
    client: c._id,
    clientName: clientsMap[c._id.toString()]?.nomComplet || "N/A",
    revenue: c.revenue,
    purchaseCount: c.purchaseCount,
    debt: c.debt || 0
  }));

  // Comptes clients
  const accounts = await ClientAccount.find({ business: businessId }).lean();
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccounts = accounts.filter(acc => acc.balance > 0).length;

  return {
    totalClients,
    newClients,
    activeClients,
    totalDebt,
    topClients,
    accounts: {
      totalBalance,
      activeAccounts
    }
  };
}

/**
 * Agrège les données commandes fournisseurs
 */
async function aggregateOrdersData(businessId, startDate, endDate) {
  const orders = await Order.find({
    business: businessId,
    orderDate: { $gte: startDate, $lte: endDate }
  })
    .populate("supplier", "nom")
    .lean();

  const totalOrders = orders.length;
  const estimatedTotal = orders.reduce((sum, o) => sum + (o.estimatedTotal || 0), 0);
  const actualTotal = orders.reduce((sum, o) => sum + (o.actualTotal || 0), 0);
  const priceVariance = actualTotal - estimatedTotal;

  const byStatus = {
    sent: 0,
    confirmed: 0,
    partially_received: 0,
    completed: 0,
    cancelled: 0
  };

  orders.forEach(order => {
    if (byStatus[order.status] !== undefined) {
      byStatus[order.status]++;
    }
  });

  // Top fournisseurs
  const supplierOrders = {};
  orders.forEach(order => {
    if (order.supplier) {
      const supplierId = order.supplier._id.toString();
      if (!supplierOrders[supplierId]) {
        supplierOrders[supplierId] = {
          supplier: order.supplier._id,
          supplierName: order.supplier.nom,
          ordersCount: 0,
          totalAmount: 0
        };
      }
      supplierOrders[supplierId].ordersCount++;
      supplierOrders[supplierId].totalAmount += order.actualTotal || order.estimatedTotal;
    }
  });

  const topSuppliers = Object.values(supplierOrders)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  return {
    totalOrders,
    estimatedTotal,
    actualTotal,
    priceVariance,
    byStatus,
    topSuppliers
  };
}

/**
 * Calcule les finances
 */
async function calculateFinances(salesData, ordersData) {
  const grossProfit = salesData.topProducts.reduce((sum, p) => sum + p.profit, 0);
  const profitMargin = salesData.totalRevenue > 0 
    ? (grossProfit / salesData.totalRevenue) * 100 
    : 0;

  // cashReceived = somme réelle des paiements enregistrés
  const cashReceived = salesData.byPaymentMethod.reduce((sum, pm) => sum + pm.amount, 0);

  // creditSales = montant des ventes pending + partial
  const creditSales = salesData.byStatus.pending.amount + salesData.byStatus.partial.amount;

  return {
    grossProfit,
    profitMargin,
    cashReceived,
    creditSales,
    cashFlow: {
      inflows: cashReceived,
      outflows: ordersData.actualTotal
    }
  };
}

/**
 * Agrège par catégories
 */
async function aggregateCategoriesData(businessId, startDate, endDate) {
  // TODO: Implémenter agrégation par catégories
  return [];
}

/**
 * Génère un rapport complet
 */
export async function generateReport({ 
  businessId, 
  type, 
  startDate, 
  endDate, 
  userId,
  notes = "" 
}) {
  try {
    const businessObjectId = new mongoose.Types.ObjectId(businessId);
    const reference = await generateReportReference(new Date(), businessObjectId);

    // Agrégation des données
    const [salesData, inventoryData, clientsData, ordersData] = await Promise.all([
      aggregateSalesData(businessObjectId, startDate, endDate),
      aggregateInventoryData(businessObjectId),
      aggregateClientsData(businessObjectId, startDate, endDate),
      aggregateOrdersData(businessObjectId, startDate, endDate)
    ]);

    const financesData = await calculateFinances(salesData, ordersData);
    const categoriesData = await aggregateCategoriesData(businessObjectId, startDate, endDate);

    // Période précédente pour comparaison
    const previousPeriod = getPreviousPeriod(startDate, endDate);
    const previousSalesData = await aggregateSalesData(
      businessObjectId, 
      previousPeriod.startDate, 
      previousPeriod.endDate
    );
    const previousInventoryData = await aggregateInventoryData(businessObjectId);
    const previousClientsData = await aggregateClientsData(
      businessObjectId,
      previousPeriod.startDate,
      previousPeriod.endDate
    );
    const previousFinancesData = await calculateFinances(previousSalesData, {});

    // Calcul des changements
    const comparison = {
      previousPeriod,
      changes: {
        revenue: {
          value: salesData.totalRevenue - previousSalesData.totalRevenue,
          percentage: calculatePercentageChange(salesData.totalRevenue, previousSalesData.totalRevenue)
        },
        sales: {
          value: salesData.totalSales - previousSalesData.totalSales,
          percentage: calculatePercentageChange(salesData.totalSales, previousSalesData.totalSales)
        },
        clients: {
          value: clientsData.activeClients - previousClientsData.activeClients,
          percentage: calculatePercentageChange(clientsData.activeClients, previousClientsData.activeClients)
        },
        profitMargin: {
          value: financesData.profitMargin - previousFinancesData.profitMargin,
          percentage: calculatePercentageChange(financesData.profitMargin, previousFinancesData.profitMargin)
        },
        inventory: {
          value: inventoryData.totalValue - previousInventoryData.totalValue,
          percentage: calculatePercentageChange(inventoryData.totalValue, previousInventoryData.totalValue)
        }
      }
    };

    // Créer le rapport
    const report = await Report.create({
      business: businessObjectId,
      reference,
      type,
      startDate,
      endDate,
      data: {
        sales: salesData,
        inventory: inventoryData,
        clients: clientsData,
        orders: ordersData,
        finances: financesData,
        categories: categoriesData
      },
      generatedBy: userId,
      generatedAt: new Date(),
      status: "finalized",
      notes,
      comparison
    });

    // History
    await createHistory({
      userId,
      action: "create",
      resource: "report",
      resourceId: report._id,
      description: `Rapport ${type} généré: ${reference} (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
      businessId: businessObjectId
    });

    return report;
  } catch (error) {
    console.error("Erreur generateReport:", error);
    throw new HttpError(500, "Erreur lors de la génération du rapport");
  }
}