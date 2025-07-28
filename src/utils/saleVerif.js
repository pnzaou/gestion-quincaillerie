"use client";

import toast from "react-hot-toast";
import { SaleValidationError } from "./erros";

export const saleVerif = (cart, saleStatus, amountPaid, total, client, payementMethod) => {
  if (cart.length === 0) {
    toast.error("Veuillez ajouter des articles au panier.");
    throw new SaleValidationError("PANIER_VIDE");
  }
  if (!saleStatus || saleStatus.trim() === "") {
    toast.error("Veuillez choisir le statut de la vente.");
    throw new SaleValidationError("STATUT_VENTE_MANQUANT");
  }
  if (saleStatus === "partial" && amountPaid <= 0) {
    toast.error("Veuillez saisir le montant versé.");
    throw new SaleValidationError("MONTANT_VERSE_MANQUANT");
  }
  if (saleStatus === "partial" && amountPaid > total) {
    toast.error(
      "L'acompte ne peut pas être supérieur au montant total de la vente."
    );
    throw new SaleValidationError("MONTANT_ACOMPTE_SUP_TOTAL");
  }
  if (
    (saleStatus === "paid" || saleStatus === "partial") &&
    (!payementMethod || payementMethod.trim() === "")
  ) {
    toast.error("Veuillez choisir un mode de paiement.");
    throw new SaleValidationError("MODE_PAIEMENT_MANQUANT");
  }
  if ((saleStatus === "partial" || saleStatus === "pending") && !client) {
    toast.error(
      "Infos du client obligatoires en cas d’acompte ou de vente à crédit."
    );
    throw new SaleValidationError("INFOS_CLIENT_MANQUANT");
  }
}; 
