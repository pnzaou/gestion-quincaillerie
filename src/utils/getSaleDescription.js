export function getSaleDescription({ status, total, amountPaid = 0, reference, userName }) {
    const remaining = total - amountPaid;
  
    switch (status) {
      case "paid":
        return `${userName} a enregistré une vente de ${total} fcfa (réf. ${reference}).`;
  
      case "partial":
        return `${userName} a encaissé ${amountPaid} fcfa en acompte (solde restant : ${remaining} fcfa).`;
  
      case "pending":
        return `${userName} a enregistré une dette client de ${total} fcfa (paiement à venir).`;
  
      default:
        throw new Error(`Statut inconnu : ${status}`);
    }
}
  