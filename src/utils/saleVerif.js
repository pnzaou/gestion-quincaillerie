import toast from "react-hot-toast";
import { SaleValidationError } from "./erros";

export const saleVerif = (cart, saleStatus, payments, total, client) => {
  if (cart.length === 0) {
    toast.error("Veuillez ajouter des articles au panier.");
    throw new SaleValidationError("PANIER_VIDE");
  }
  if (!saleStatus || saleStatus.trim() === "") {
    toast.error("Veuillez choisir le statut de la vente.");
    throw new SaleValidationError("STATUT_VENTE_MANQUANT");
  }

  const paymentsSum = Array.isArray(payments) 
    ? payments.reduce((s, p) => s + Number(p.amount || 0), 0) 
    : 0;

  // ✅ Fonction helper pour comparer avec tolérance d'arrondi
  const isEqual = (a, b, tolerance = 0.01) => Math.abs(a - b) < tolerance;

  // Paid => paymentsSum === total (avec tolérance)
  if (saleStatus === "paid" && !isEqual(paymentsSum, total)) {
    toast.error(
      `Le total des paiements (${paymentsSum.toFixed(2)} FCFA) doit être égal au total de la vente (${total.toFixed(2)} FCFA).`
    );
    throw new SaleValidationError("PAIEMENT_TOTAL_MISMATCH");
  }

  // Partial => 0 < paymentsSum < total
  if (saleStatus === "partial" && !(paymentsSum > 0 && paymentsSum < total)) {
    toast.error("Pour un acompte (partial), le montant payé doit être > 0 et < total.");
    throw new SaleValidationError("PARTIAL_INVALID");
  }

  // Pending => paymentsSum === 0
  if (saleStatus === "pending" && paymentsSum !== 0) {
    toast.error("Pour un statut 'pending', aucun paiement immédiat ne doit être enregistré.");
    throw new SaleValidationError("PENDING_WITH_PAYMENTS");
  }

  // Pending => client requis
  if ((saleStatus === "pending" || saleStatus === "partial") && !client) {
    toast.error("Sélectionner un client pour enregistrer une dette ou une avance.");
    throw new SaleValidationError("CLIENT_REQUIRED_FOR_PENDING_OR_PARTIAL");
  }

  // Somme des paiements ne doit pas dépasser total
  if (paymentsSum > total + 0.01) { // ✅ Tolérance d'arrondi
    toast.error("La somme des paiements dépasse le total.");
    throw new SaleValidationError("PAYMENTS_EXCEED_TOTAL");
  }

  // Si un paiement account existe => client requis
  if (Array.isArray(payments) && payments.some(p => String(p.method).toLowerCase() === "account") && !client) {
    toast.error("Sélectionner un client pour utiliser le Compte client.");
    throw new SaleValidationError("CLIENT_REQUIRED_FOR_ACCOUNT");
  }
};