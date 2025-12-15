import Order from "@/models/Order.model";
import mongoose from "mongoose";

/**
 * Récupère les statistiques des commandes par boutique
 */
export async function getOrdersStatistics({ businessId, startDate, endDate } = {}) {
  if (!businessId) {
    throw new Error("businessId est obligatoire pour getOrdersStatistics");
  }

  const businessObjectId = new mongoose.Types.ObjectId(businessId);

  const baseFilter = {
    business: businessObjectId
  };

  // Filtre de date optionnel
  if (startDate || endDate) {
    baseFilter.orderDate = {};
    if (startDate) baseFilter.orderDate.$gte = startDate;
    if (endDate) baseFilter.orderDate.$lte = endDate;
  }

  // Exécution de toutes les requêtes en parallèle
  const [
    totalOrders,
    draftCount,
    sentCount,
    confirmedCount,
    partiallyReceivedCount,
    completedCount,
    cancelledCount,
    totalAmount,
    averageAmount
  ] = await Promise.all([
    // Total des commandes
    Order.countDocuments(baseFilter),

    // Commandes par statut
    Order.countDocuments({ ...baseFilter, status: "draft" }),
    Order.countDocuments({ ...baseFilter, status: "sent" }),
    Order.countDocuments({ ...baseFilter, status: "confirmed" }),
    Order.countDocuments({ ...baseFilter, status: "partially_received" }),
    Order.countDocuments({ ...baseFilter, status: "completed" }),
    Order.countDocuments({ ...baseFilter, status: "cancelled" }),

    // Montant total des commandes (hors cancelled)
    Order.aggregate([
      {
        $match: {
          ...baseFilter,
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" }
        }
      }
    ]),

    // Montant moyen
    Order.aggregate([
      {
        $match: {
          ...baseFilter,
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: null,
          avgAmount: { $avg: "$total" }
        }
      }
    ])
  ]);

  return {
    totalOrders,
    draftCount,
    sentCount,
    confirmedCount,
    partiallyReceivedCount,
    completedCount,
    cancelledCount,
    totalAmount: totalAmount[0]?.total || 0,
    averageAmount: averageAmount[0]?.avgAmount || 0,
  };
}