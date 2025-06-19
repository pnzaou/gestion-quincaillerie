export function getSaleDescription({ status, total, amountPaid = 0, reference, userName }) {
    const remaining = total - amountPaid;
  
    switch (status) {
      case "paid":
        return `${userName} a enregistré une vente de ${total} FCFA (réf. ${reference}).`;
  
      case "partial":
        return `${userName} a encaissé ${amountPaid} FCFA en acompte (solde restant : ${remaining} FCFA).`;
  
      case "pending":
        return `${userName} a enregistré une dette client de ${total} FCFA (paiement à venir).`;
  
      default:
        throw new Error(`Statut inconnu : ${status}`);
    }
}
  