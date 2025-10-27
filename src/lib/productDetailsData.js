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
 * QteInitial × (prixAchatDetail si présent, sinon prixAchatEnGros)
 */
export const getTotalDepense = (product) => {
  if (!product) return 0
  
  const prixAchat = product.prixAchatDetail || product.prixAchatEnGros
  return product.QteInitial * prixAchat
}

/**
 * Calcule le montant total qu'on prétend gagner avec ce produit
 * QteInitial × (prixVenteDetail si présent, sinon prixVenteEnGros)
 */
export const getTotalAttendu = (product) => {
  if (!product) return 0
  
  const prixVente = product.prixVenteDetail || product.prixVenteEnGros
  return product.QteInitial * prixVente
}


/**
 * Calcule le montant qu'on a déjà gagné grâce à ce produit
 * - Somme des revenus des ventes avec statut "paid"
 * - Somme des paiements pour ventes "partial" qui contiennent UNIQUEMENT ce produit
 * (quantité × prix) pour chaque item de vente contenant ce produit
 */
export const getTotalVendu = async (productId) => {
  try {
    await dbConnection()
    
    const Payment = (await import("@/models/Payment.model")).default
    
    const [result] = await Sale.aggregate([
      {
        $match: {
          status: { $in: ["paid", "partial"] },
          "items.product": productId
        }
      },
      {
        $addFields: {
          itemsCount: { $size: "$items" }
        }
      },
      {
        $facet: {
          // Ventes totalement payées
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
          // Ventes partielles avec un seul produit
          partial: [
            { 
              $match: { 
                status: "partial",
                itemsCount: 1 // Uniquement les ventes avec un seul produit
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
 * Marge = Total vendu - (Coût d'achat × quantité vendue)
 * 
 * Note: On calcule la marge réelle en prenant en compte le coût d'achat
 * des unités effectivement vendues
 */
export const getMarge = async (product) => {
  if (!product) return 0
  
  try {
    const totalVendu = await getTotalVendu(product._id)
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
 * (Total vendu / Total attendu) × 100
 */
export const getProgressPercentage = async (product) => {
  if (!product) return 0
  
  try {
    const totalVendu = await getTotalVendu(product._id)
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
 * Fonction principale à appeler depuis la page
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
    const totalVendu = await getTotalVendu(product._id)
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