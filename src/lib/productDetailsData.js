import Sale from "@/models/Sale.model"
import dbConnection from "./db"
import Product from "@/models/Product.model"
import PurchaseHistory from "@/models/PurchaseHistory.model"
import mongoose from "mongoose"

/**
 * Récupère les détails d'un produit par son ID
 */
export const getProductById = async (productId) => {
  try {
    await dbConnection()
    
    const product = await Product.findById(productId)
      .populate('category_id')
      .populate('supplier_id')
      .lean()
    
    if (!product) {
      return null
    }
    
    return product
  } catch (error) {
    console.error("Erreur getProductById:", error)
    return null
  }
}

/**
 * Calcule le coût d'achat RÉEL total d'un produit
 * ✅ CORRIGÉ : Exclut les quantités transférées vers d'autres boutiques
 */
export const getTotalRealCost = async (productId, businessId) => {
  try {
    await dbConnection()
    
    // 1️⃣ Coût total des achats (commandes + transferts reçus)
    const purchases = await PurchaseHistory.find({
      business: businessId,
      product: productId
    })
    const totalPurchasedCost = purchases.reduce((sum, p) => sum + p.totalCost, 0)
    
    // 2️⃣ Récupérer les transferts SORTANTS avec leur prix RÉEL
    const StockTransfer = (await import("@/models/StockTransfer.model")).default
    
    const outgoingTransfers = await StockTransfer.find({
      sourceBusiness: new mongoose.Types.ObjectId(businessId),
      status: { $in: ['validated', 'received'] },
      'items.sourceProductId': new mongoose.Types.ObjectId(productId)
    })
    
    // 3️⃣ Calculer le coût des transferts avec leur PRIX RÉEL
    let transferredCost = 0
    for (const transfer of outgoingTransfers) {
      for (const item of transfer.items) {
        if (item.sourceProductId.toString() === productId.toString()) {
          // ✅ Utiliser le prix réel du transfert (transferPrice)
          transferredCost += item.quantity * item.transferPrice
        }
      }
    }
    
    // 4️⃣ Coût réel = Ce qu'on a acheté - Ce qu'on a transféré (au prix réel)
    return Math.round((totalPurchasedCost - transferredCost) * 100) / 100
    
  } catch (error) {
    console.error("Erreur getTotalRealCost:", error)
    return 0
  }
}

/**
 * Calcule la quantité totale achetée NETTE (après transferts sortants)
 */
export const getTotalQuantityPurchased = async (productId, businessId) => {
  try {
    await dbConnection()
    
    // Quantité totale achetée
    const purchases = await PurchaseHistory.find({
      business: businessId,
      product: productId
    })
    const totalPurchased = purchases.reduce((sum, p) => sum + p.quantity, 0)
    
    // Quantité transférée sortante
    const StockTransfer = (await import("@/models/StockTransfer.model")).default
    
    const outgoingTransfers = await StockTransfer.find({
      sourceBusiness: new mongoose.Types.ObjectId(businessId),
      status: { $in: ['validated', 'received'] },
      'items.sourceProductId': new mongoose.Types.ObjectId(productId)
    })
    
    let transferredQty = 0
    for (const transfer of outgoingTransfers) {
      for (const item of transfer.items) {
        if (item.sourceProductId.toString() === productId.toString()) {
          transferredQty += item.quantity
        }
      }
    }
    
    // ✅ Quantité nette = Achetée - Transférée
    // Dans ton cas : 106 - 50 = 56 unités
    return Math.round((totalPurchased - transferredQty) * 100) / 100
    
  } catch (error) {
    console.error("Erreur getTotalQuantityPurchased:", error)
    return 0
  }
}

/**
 * Calcule le prix d'achat moyen pondéré
 */
export const getAveragePurchasePrice = async (productId, businessId) => {
  try {
    const totalCost = await getTotalRealCost(productId, businessId)
    const totalQty = await getTotalQuantityPurchased(productId, businessId)
    if (totalQty === 0) return 0
    return Math.round((totalCost / totalQty) * 100) / 100
  } catch (error) {
    console.error("Erreur getAveragePurchasePrice:", error)
    return 0
  }
}

/**
 * Calcule le total dépensé RÉEL (pas estimé)
 */
export const getTotalDepense = async (productId, businessId) => {
  return await getTotalRealCost(productId, businessId)
}

/**
 * Calcule le montant total qu'on prétend gagner avec ce produit
 */
export const getTotalAttendu = (product) => {
  if (!product) return 0
  
  const prixVente = product.prixVente
  return product.QteInitial * prixVente
}

/**
 * Calcule le montant qu'on a déjà gagné grâce à ce produit
 */
export const getTotalVendu = async (productId, businessId) => {
  try {
    await dbConnection()
    
    const Payment = (await import("@/models/Payment.model")).default
    
    const [result] = await Sale.aggregate([
      {
        $match: {
          status: { $in: ["paid", "partial"] },
          "items.product": productId,
          business: businessId
        }
      },
      {
        $facet: {
          paid: [
            { $match: { status: "paid" } },
            { $unwind: "$items" },
            { $match: { "items.product": productId } },
            {
              $group: {
                _id: null,
                totalRevenue: { 
                  $sum: { 
                    $multiply: ["$items.quantity", "$items.price"] 
                  } 
                }
              }
            }
          ],
          partial: [
            { $match: { status: "partial" } },
            { $unwind: "$items" },
            { $match: { "items.product": productId } },
            {
              $lookup: {
                from: Payment.collection.name,
                localField: "_id",
                foreignField: "sale",
                as: "payments"
              }
            },
            {
              $addFields: {
                itemTotal: { $multiply: ["$items.quantity", "$items.price"] }
              }
            },
            {
              $addFields: {
                totalPayments: { $sum: "$payments.amount" }
              }
            },
            {
              $addFields: {
                productRevenue: {
                  $multiply: [
                    { $divide: ["$itemTotal", "$total"] },
                    "$totalPayments"
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$productRevenue" }
              }
            }
          ]
        }
      }
    ])
    
    const paidRevenue = result?.paid?.[0]?.totalRevenue || 0
    const partialRevenue = result?.partial?.[0]?.totalRevenue || 0
    
    return paidRevenue + partialRevenue
  } catch (error) {
    console.error("Erreur getTotalVendu:", error)
    return 0
  }
}

/**
 * Calcule la marge RÉELLE
 * ✅ CORRIGÉ : Exclut les transferts sortants
 */
export const getMarge = async (product) => {
  if (!product) return 0
  
  try {
    // Total vendu (paiements reçus)
    const totalVendu = await getTotalVendu(product._id, product.business)
    
    // ✅ Quantité transférée
    const StockTransfer = (await import("@/models/StockTransfer.model")).default
    
    const outgoingTransfers = await StockTransfer.find({
      sourceBusiness: product.business,
      status: { $in: ['validated', 'received'] },
      'items.sourceProductId': product._id
    })
    
    let transferredQty = 0
    for (const transfer of outgoingTransfers) {
      for (const item of transfer.items) {
        if (item.sourceProductId.toString() === product._id.toString()) {
          transferredQty += item.quantity
        }
      }
    }
    
    // ✅ Quantité VRAIMENT vendue (pas transférée)
    const qteVendue = product.QteInitial - product.QteStock - transferredQty
    
    // Coût d'achat RÉEL moyen
    const avgPurchasePrice = await getAveragePurchasePrice(product._id, product.business)
    
    // Coût total des produits vendus
    const cogs = qteVendue * avgPurchasePrice
    
    // Marge = Revenus - Coûts
    return Math.round((totalVendu - cogs) * 100) / 100
    
  } catch (error) {
    console.error("Erreur getMarge:", error)
    return 0
  }
}

/**
 * Calcule le pourcentage d'avancement vers l'objectif
 */
export const getProgressPercentage = async (product) => {
  if (!product) return 0
  
  try {
    const totalVendu = await getTotalVendu(product._id, product.business)
    const totalAttendu = getTotalAttendu(product)
    
    if (totalAttendu === 0) return 0
    
    return (totalVendu / totalAttendu) * 100
  } catch (error) {
    console.error("Erreur getProgressPercentage:", error)
    return 0
  }
}

/**
 * Récupère toutes les analytics de rentabilité d'un produit
 */
export const getProductAnalytics = async (productId) => {
  try {
    await dbConnection()
    
    const product = await getProductById(productId)
    
    if (!product) {
      return null
    }
    
    const totalDepense = await getTotalDepense(product._id, product.business)
    const totalAttendu = getTotalAttendu(product)
    const totalVendu = await getTotalVendu(product._id, product.business)
    const marge = await getMarge(product)
    const progressPercentage = await getProgressPercentage(product)
    
    return {
      product,
      analytics: {
        totalDepense,
        totalAttendu,
        totalVendu,
        marge,
        progressPercentage
      }
    }
  } catch (error) {
    console.error("Erreur getProductAnalytics:", error)
    return null
  }
}