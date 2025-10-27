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
            // garder les ventes partial même si aucun paiement enregistré (prévenir la perte par $unwind)
            { $unwind: { path: "$payments", preserveNullAndEmptyArrays: true } },
            // sommer les montants (si pas de payment, prendre 0)
            { $group: { _id: null, sum: { $sum: { $ifNull: ["$payments.amount", 0] } } } }
          ]
        }
      }
    ]);

    const salesCount = res.salesCount[0]?.count || 0
    const paidRevenue = res.paid[0]?.sum || 0
    const partialRevenue = res.partial[0]?.sum || 0

    return {
      salesCount,
      paidRevenue,
      partialRevenue,
      totalRevenue: paidRevenue + partialRevenue,
    };

  } catch (error) {
    console.error("Erreur computeStats:", error);
    return { salesCount: 0, paidRevenue: 0, partialRevenue: 0, totalRevenue: 0 };
  }
}

export const getTodayStats = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfNextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return computeStats(startOfDay, startOfNextDay)
}

export const getMonthRevenue = async (year = new Date().getFullYear(), month = new Date().getMonth()) => {
  const startOfMonth = new Date(year, month, 1);
  const startOfNextMonth = new Date(year, month + 1, 1);
  return computeStats(startOfMonth, startOfNextMonth)
}

export const getPreviousMonthRevenue = async () => {
  const now = new Date();
  // calcul du mois précédent (gère janvier correctement)
  const prevMonth = (now.getMonth() + 11) % 12;
  const yearOfPrevMonth = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const startOfPrevMonth = new Date(yearOfPrevMonth, prevMonth, 1);
  const startOfNextMonth = new Date(yearOfPrevMonth, prevMonth + 1, 1);

  return computeStats(startOfPrevMonth, startOfNextMonth);
}

export const getYearRevenue = async (year = new Date().getFullYear()) => {
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);
  return computeStats(startOfYear, startOfNextYear);
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

/**
 * Top produits vendus (quantité & revenu) entre start et end.
 * Compte uniquement les ventes ayant status "paid" ou "partial".
 * Retourne un tableau trié desc par quantité vendue.
 */
export const getTopProducts = async (start, end, limit = 10) => {
  try {
    await dbConnection();

    const pipeline = [
      {
        $match: {
          dateExacte: { $gte: start, $lt: end },
          status: { $in: ["paid", "partial"] }, // on considère uniquement les ventes payées ou partiellement payées
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      // récupérer les details du produit
      {
        $lookup: {
          from: Product.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          quantitySold: 1,
          revenue: 1,
          productName: "$product.nom",
          productReference: "$product.reference",
          productImage: "$product.image",
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: limit },
    ];

    const results = await Sale.aggregate(pipeline);
    return results;
  } catch (error) {
    console.error("Erreur getTopProducts:", error);
    return [];
  }
};

/**
 * Pour un mois donné (start, end) on réutilise la logique de computeStats:
 * - somme des 'paid' : sum of $total
 * - somme des paiements pour 'partial' (lookup Payments)
 *
 * On retourne la somme totale revenue (paid + partialPayments)
 */
const computeStatsForMonthRange = async (start, end) => {
  const [res] = await Sale.aggregate([
    {
      $match: {
        dateExacte: { $gte: start, $lt: end }
      }
    },
    {
      $facet: {
        paid: [
          { $match: { status: "paid" } },
          { $group: { _id: null, sum: { $sum: "$total" } } }
        ],
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
          { $unwind: { path: "$payments", preserveNullAndEmptyArrays: true } },
          { $group: { _id: null, sum: { $sum: { $ifNull: ["$payments.amount", 0] } } } }
        ]
      }
    }
  ])

  const paidSum = res.paid?.[0]?.sum || 0
  const partialPaymentsSum = res.partial?.[0]?.sum || 0
  return paidSum + partialPaymentsSum
}

/**
 * Renvoie un objet contenant les mois (Jan..Dec) et les revenues correspondants pour l'année passée.
 * Les mois avant le démarrage de l'activité sont à 0. Les mois futurs sont aussi inclus mais mis à 0.
 */
export const getYearlyMonthlyRevenue = async (year = new Date().getFullYear()) => {
  try {
    await dbConnection()

    const months = [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ]

    const revenues = []
    for (let m = 0; m < 12; m++) {
      const startOfMonth = new Date(year, m, 1)
      const startOfNextMonth = new Date(year, m + 1, 1)

      // si la période est future (après le mois courant de la même année), on met 0
      const now = new Date()
      if (year > now.getFullYear() || (year === now.getFullYear() && m > now.getMonth())) {
        revenues.push(0)
        continue
      }

      // calcul du revenu du mois (paid totals + paiements des partial)
      const monthRevenue = await computeStatsForMonthRange(startOfMonth, startOfNextMonth)
      revenues.push(monthRevenue)
    }

    const total = revenues.reduce((a, b) => a + b, 0)

    return {
      year,
      months,
      revenues, // tableau de 12 nombres (Jan -> Dec)
      total
    }
  } catch (error) {
    console.error("Erreur getYearlyMonthlyRevenue:", error)
    return { year, months: [], revenues: Array(12).fill(0), total: 0 }
  }
}

export const getTotalDebts = async () => {
  try {
    await dbConnection();

    const [res] = await Sale.aggregate([
      {
        $match: {
          status: { $in: ["pending", "partial"] }, // ventes non totalement réglées
        },
      },
      {
        $lookup: {
          from: Payment.collection.name,
          localField: "_id",
          foreignField: "sale",
          as: "payments",
        },
      },
      {
        $addFields: {
          paymentsSum: {
            $reduce: {
              input: "$payments",
              initialValue: 0,
              in: { $add: ["$$value", { $ifNull: ["$$this.amount", 0] }] },
            },
          },
        },
      },
      {
        $addFields: {
          remainingRaw: {
            $ifNull: ["$amountDue", { $subtract: ["$total", "$paymentsSum"] }],
          },
        },
      },
      {
        $addFields: {
          remaining: { $max: ["$remainingRaw", 0] }, // éviter négatifs (surpaiement)
        },
      },
      {
        $group: {
          _id: null,
          totalDebts: { $sum: "$remaining" },
        },
      },
    ]);

    return res?.totalDebts || 0;
  } catch (error) {
    console.error("Erreur getTotalDebts:", error);
    return 0;
  }
};