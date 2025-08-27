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

  const paymentsSum = Array.isArray(payments) ? payments.reduce((s,p) => s + Number(p.amount || 0), 0) : 0;

  // Paid => paymentsSum === total
  if (saleStatus === "paid" && paymentsSum !== total) {
    toast.error("Le total des paiements doit être égal au total de la vente (statut reglé).");
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

  // Somme des paiements ne doit pas dépasser total
  if (paymentsSum > total) {
    toast.error("La somme des paiements dépasse le total.");
    throw new SaleValidationError("PAYMENTS_EXCEED_TOTAL");
  }

  // Si un paiement account existe => client requis
  if (Array.isArray(payments) && payments.some(p => String(p.method).toLowerCase() === "account") && !client) {
    toast.error("Sélectionner un client pour utiliser le Compte client.");
    throw new SaleValidationError("CLIENT_REQUIRED_FOR_ACCOUNT");
  }
};
