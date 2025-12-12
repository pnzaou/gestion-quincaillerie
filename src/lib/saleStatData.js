import Sale from "@/models/Sale.model";
import mongoose from "mongoose";

/**
 * Récupère les statistiques des ventes
 * @param {Object} options - Options de filtrage
 * @param {string} options.userId - ID de l'utilisateur (pour filtrer par vendeur)
 * @param {string} options.role - Rôle de l'utilisateur ('admin' ou autre)
 * @param {string} options.businessId - ID de la boutique (obligatoire)
 * @param {Date} options.startDate - Date de début (optionnel)
 * @param {Date} options.endDate - Date de fin (optionnel)
 * @returns {Promise<Object>} Statistiques des ventes
 */
export async function getSalesStatistics({ userId, role, businessId, startDate, endDate } = {}) {
  // ✅ Vérification businessId obligatoire
  if (!businessId) {
    throw new Error("businessId est obligatoire pour getSalesStatistics");
  }

  const businessObjectId = new mongoose.Types.ObjectId(businessId);

  // Filtre de base : boutique + vendeur (si pas admin)
  const baseFilter = {
    business: businessObjectId, // ✅ Filtrer par boutique
    ...(role !== "admin" && { vendeur: userId })
  };
  
  // Filtre de date optionnel
  if (startDate || endDate) {
    baseFilter.dateExacte = {};
    if (startDate) baseFilter.dateExacte.$gte = startDate;
    if (endDate) baseFilter.dateExacte.$lte = endDate;
  }

  // Exécution de toutes les requêtes en parallèle
  const [revenueStats, totalSalesCount, debtStats, paidStats, pendingCount, partialCount, cancelledCount] = 
    await Promise.all([
      // Revenu réellement encaissé
      Sale.aggregate([
        { 
          $match: { 
            ...baseFilter,
            status: { $in: ["paid", "partial"] }
          } 
        },
        {
          $project: {
            // Pour paid: total complet
            // Pour partial: total - amountDue (ce qui a été payé)
            receivedAmount: {
              $cond: {
                if: { $eq: ["$status", "paid"] },
                then: "$total",
                else: { $subtract: ["$total", { $ifNull: ["$amountDue", 0] }] }
              }
            },
            total: 1
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$receivedAmount" },
            avgSale: { $avg: "$total" }
          }
        }
      ]),

      // Nombre total de ventes (paid + pending + partial)
      Sale.countDocuments({
        ...baseFilter,
        status: { $in: ["paid", "pending", "partial"] }
      }),

      // Dettes totales
      Sale.aggregate([
        {
          $match: {
            ...baseFilter,
            status: { $in: ["pending", "partial"] },
            amountDue: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            totalDebt: { $sum: "$amountDue" },
            debtCount: { $sum: 1 }
          }
        }
      ]),

      // Ventes payées
      Sale.aggregate([
        { 
          $match: { 
            ...baseFilter,
            status: "paid" 
          } 
        },
        {
          $group: {
            _id: null,
            totalPaid: { $sum: "$total" },
            paidCount: { $sum: 1 }
          }
        }
      ]),

      // Ventes en attente
      Sale.countDocuments({ 
        ...baseFilter,
        status: "pending" 
      }),

      // Ventes partielles
      Sale.countDocuments({ 
        ...baseFilter,
        status: "partial" 
      }),

      // Ventes annulées
      Sale.countDocuments({ 
        ...baseFilter,
        status: "cancelled" 
      })
    ]);

  // Formatage des résultats
  return {
    totalRevenue: revenueStats[0]?.totalRevenue || 0,
    totalSales: totalSalesCount || 0,
    avgSale: revenueStats[0]?.avgSale || 0,
    totalDebt: debtStats[0]?.totalDebt || 0,
    debtCount: debtStats[0]?.debtCount || 0,
    totalPaid: paidStats[0]?.totalPaid || 0,
    paidCount: paidStats[0]?.paidCount || 0,
    pendingCount: pendingCount || 0,
    partialCount: partialCount || 0,
    cancelledCount: cancelledCount || 0
  };
}

/**
 * Récupère les statistiques des ventes pour une période spécifique
 * @param {Object} options - Options de filtrage
 * @param {string} options.period - Période ('today', 'week', 'month', 'year')
 * @param {string} options.userId - ID de l'utilisateur
 * @param {string} options.role - Rôle de l'utilisateur
 * @param {string} options.businessId - ID de la boutique (obligatoire)
 * @returns {Promise<Object>} Statistiques des ventes
 */
export async function getSalesStatisticsByPeriod({ period = 'all', userId, role, businessId } = {}) {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    
    case 'week':
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lundi
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      break;
    
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    
    default: // 'all'
      startDate = null;
      endDate = null;
  }

  return getSalesStatistics({ userId, role, businessId, startDate, endDate });
}

/**
 * Récupère les statistiques de comparaison entre deux périodes
 * @param {Object} options - Options de filtrage
 * @param {Date} options.currentStart - Début période actuelle
 * @param {Date} options.currentEnd - Fin période actuelle
 * @param {Date} options.previousStart - Début période précédente
 * @param {Date} options.previousEnd - Fin période précédente
 * @param {string} options.userId - ID de l'utilisateur
 * @param {string} options.role - Rôle de l'utilisateur
 * @param {string} options.businessId - ID de la boutique (obligatoire)
 * @returns {Promise<Object>} Statistiques comparatives
 */
export async function getComparativeSalesStatistics({
  currentStart,
  currentEnd,
  previousStart,
  previousEnd,
  userId,
  role,
  businessId
} = {}) {
  const [currentStats, previousStats] = await Promise.all([
    getSalesStatistics({ userId, role, businessId, startDate: currentStart, endDate: currentEnd }),
    getSalesStatistics({ userId, role, businessId, startDate: previousStart, endDate: previousEnd })
  ]);

  // Calcul des variations en pourcentage
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    current: currentStats,
    previous: previousStats,
    changes: {
      revenue: calculatePercentageChange(currentStats.totalRevenue, previousStats.totalRevenue),
      sales: calculatePercentageChange(currentStats.totalSales, previousStats.totalSales),
      debt: calculatePercentageChange(currentStats.totalDebt, previousStats.totalDebt),
      avgSale: calculatePercentageChange(currentStats.avgSale, previousStats.avgSale)
    }
  };
}