import Sale from "@/models/Sale.model"
import dbConnection from "./db"
import Product from "@/models/Product.model"

export const getTodayStats = async () => {
    try {
        await dbConnection()

        const now = new Date()
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0, 0, 0, 0
        );
        const startOfNextDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          0, 0, 0, 0
        );

        const [result] = await Sale.aggregate([
          {
            $match: {
              dateExacte: {
                $gte: startOfDay,
                $lt: startOfNextDay,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$total" },
              salesCount: { $sum: 1 }
            },
          },
        ]);

        return {
            totalRevenue: result?.totalRevenue || 0,
            salesCount: result?.salesCount || 0
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des stats de la journée.", error)
        return { totalRevenue: 0, salesCount: 0 };
    }
}

export const getMonthRevenue = async () => {
    try {
        await dbConnection()

        const now = new Date()
        const startOfMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
          0, 0, 0, 0
        );
        const startOfNextMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1,
          0, 0, 0, 0
        );

        const [result] = await Sale.aggregate([
          {
            $match: {
              dateExacte: {
                $gte: startOfMonth,
                $lt: startOfNextMonth,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$total" },
            },
          },
        ]);

        return result?.totalRevenue || 0;
    } catch (error) {
        console.error("Erreur lors de la récupération du chiffre d'affaires du mois.", error)
        return 0;
    }
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