"use client";

import toast from "react-hot-toast";

export const saleVerif = (cart, saleStatus, amountPaid, total, client, payementMethod) => {
  if (cart.length === 0) {
    toast.error("Veuillez ajouter des articles au panier.");
    return;
  }
  if (!saleStatus || saleStatus.trim() === "") {
    toast.error("Veuillez choisir le statut de la vente.");
    return;
  }
  if (saleStatus === "partial" && amountPaid <= 0) {
    toast.error("Veuillez saisir le montant versé.");
    return;
  }
  if (saleStatus === "partial" && amountPaid > total) {
    toast.error(
      "L'acompte ne peut pas être supérieur au montant total de la vente."
    );
    return;
  }
  if (
    (saleStatus === "paid" || saleStatus === "partial") &&
    (!payementMethod || payementMethod.trim() === "")
  ) {
    toast.error("Veuillez choisir un mode de paiement.");
    return;
  }
  if ((saleStatus === "partial" || saleStatus === "pending") && !client) {
    toast.error(
      "Infos du client obligatoires en cas d’acompte ou de vente à crédit."
    );
    return;
  }
};
