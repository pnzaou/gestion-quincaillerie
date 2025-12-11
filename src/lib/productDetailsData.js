import Sale from "@/models/Sale.model"
import dbConnection from "./db"
import Product from "@/models/Product.model"

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
 * Calcule le montant total dépensé pour acheter le produit
 */
export const getTotalDepense = (product) => {
  if (!product) return 0
  
  const prixAchat = product.prixAchatDetail || product.prixAchatEnGros
  return product.QteInitial * prixAchat
}

/**
 * Calcule le montant total qu'on prétend gagner avec ce produit
 */
export const getTotalAttendu = (product) => {
  if (!product) return 0
  
  const prixVente = product.prixVenteDetail || product.prixVenteEnGros
  return product.QteInitial * prixVente
}

/**
 * Calcule le montant qu'on a déjà gagné grâce à ce produit
 * Filtré par boutique
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
          business: businessId // Filtrer par boutique
        }
      },
      {
        $addFields: {
          itemsCount: { $size: "$items" }
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
            { 
              $match: { 
                status: "partial",
                itemsCount: 1
              } 
            },
            {
              $lookup: {
                from: Payment.collection.name,
                localField: "_id",
                foreignField: "sale",
                as: "payments"
              }
            },
            { $unwind: { path: "$payments", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: null,
                totalRevenue: { 
                  $sum: { 
                    $ifNull: ["$payments.amount", 0] 
                  } 
                }
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
 * Calcule la marge bénéficiaire du produit
 */
export const getMarge = async (product) => {
  if (!product) return 0
  
  try {
    const totalVendu = await getTotalVendu(product._id, product.business)
    const qteVendue = product.QteInitial - product.QteStock
    const prixAchat = product.prixAchatDetail || product.prixAchatEnGros
    const coutAchatVendu = qteVendue * prixAchat
    
    return totalVendu - coutAchatVendu
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
    
    const totalDepense = getTotalDepense(product)
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