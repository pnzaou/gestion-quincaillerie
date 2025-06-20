import Sale from "@/models/Sale.model"
import dbConnection from "./db"
import Product from "@/models/Product.model"
import Payment from "@/models/Payment.model"
import Order from "@/models/Order.model"

const computeStats = async (start, end) => {
  try {
    await dbConnection()

    const [res] = await Sale.aggregate([
      // 1) on filtre sur la date
      {
        $match: {
          dateExacte: { $gte: start, $lt: end }
        }
      },
      // 2) on branche en 3 facettes
      {
        $facet: {
          // a) nombre total de ventes (tous statuts)
          salesCount: [{ $count: "count" }],

          // b) revenue des ventes fully paid
          paid: [
            { $match: { status: "paid" } },
            { $group: { _id: null, sum: { $sum: "$total" } } }
          ],

          // c) revenue venant de paiements partiels
          partial: [
            { $match: { status: "partial" } },
            {
              $lookup: {
                from: Payment.collection.name,
                localField: "_id",
                foreignField: "sale",
                as: "payments"
              }
            },
            { $unwind: "$payments" },
            { $group: { _id: null, sum: { $sum: "$payments.amount" } } }
          ]
        }
      }
    ]);

    const salesCount = res.salesCount[0]?.count || 0
    const paidRevenue = res.paid[0]?.sum || 0
    const partialRevenue = res.partial[0]?.sum || 0

    return { salesCount, totalRevenue: paidRevenue + partialRevenue }

  } catch (error) {
    console.error("Erreur computeStats:", error);
    return { salesCount: 0, totalRevenue: 0 };
  }
}

export const getTodayStats = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfNextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return computeStats(startOfDay, startOfNextDay)
}

export const getMonthRevenue = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return computeStats(startOfMonth, startOfNextMonth)
}

export const getStockAlerts = async () => {
    try {
        await dbConnection()

        const [result] = await Product.aggregate([
            {
                $facet: {
                    soon: [
                        {
                            // QteStock === QteAlerte
                            $match: { $expr: { $eq: ["$QteStock", "$QteAlerte"] }}
                        },
                        { $count: "count" }
                    ],
                    outOfStock: [
                        // QteStock === 0
                        { $match: { QteStock: 0 } },
                        { $count: "count" }
                    ]
                }
            }
        ])
        
        return {
            soonCount: result?.soon?.[0]?.count || 0,
            outOfStockCount: result?.outOfStock?.[0]?.count || 0
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des alertes de stock.", error)
        return { soonCount: 0, outOfStockCount: 0 };
    }
}

export const countOrdersToReceive = async () => {
  try {
    await dbConnection()

    const count = await Order.countDocuments({
      status: { $in: ["confirmed", "partially_received"] }
    })

    return count;
  } catch (error) {
    console.error("Erreur lors du comptage des commandes à recevoir:", error);
    return 0;
  }
}