import { formatPeriod, formatReportType } from "@/helpers/report.helpers";

/**
 * Génère un CSV du rapport
 */
export function generateReportCSV(report) {
  const lines = [];
  
  // Header
  lines.push('RAPPORT DE GESTION');
  lines.push(`Référence,${report.reference}`);
  lines.push(`Type,${formatReportType(report.type)}`);
  lines.push(`Période,${formatPeriod(report.startDate, report.endDate)}`);
  lines.push(`Généré le,${new Date(report.generatedAt).toLocaleDateString('fr-FR')}`);
  lines.push('');

  // Ventes
  lines.push('VENTES');
  lines.push('Indicateur,Valeur');
  lines.push(`Chiffre d'affaires,${report.data.sales.totalRevenue} FCFA`);
  lines.push(`Nombre de ventes,${report.data.sales.totalSales}`);
  lines.push(`Panier moyen,${report.data.sales.averageSale} FCFA`);
  lines.push(`Remises totales,${report.data.sales.discount} FCFA`);
  lines.push('');

  // Ventes par statut
  lines.push('VENTES PAR STATUT');
  lines.push('Statut,Nombre,Montant (FCFA)');
  lines.push(`Payées,${report.data.sales.byStatus.paid.count},${report.data.sales.byStatus.paid.amount}`);
  lines.push(`En attente,${report.data.sales.byStatus.pending.count},${report.data.sales.byStatus.pending.amount}`);
  lines.push(`Partielles,${report.data.sales.byStatus.partial.count},${report.data.sales.byStatus.partial.amount}`);
  lines.push(`Annulées,${report.data.sales.byStatus.cancelled.count},${report.data.sales.byStatus.cancelled.amount}`);
  lines.push('');

  // Top produits
  if (report.data.sales.topProducts.length > 0) {
    lines.push('TOP PRODUITS');
    lines.push('Produit,Quantité,CA (FCFA),Marge (FCFA)');
    report.data.sales.topProducts.forEach(p => {
      lines.push(`"${p.productName}",${p.quantity},${p.revenue},${p.profit}`);
    });
    lines.push('');
  }

  // Stock
  lines.push('STOCK');
  lines.push('Indicateur,Valeur');
  lines.push(`Valeur totale,${report.data.inventory.totalValue} FCFA`);
  lines.push(`Nombre de produits,${report.data.inventory.totalProducts}`);
  lines.push(`En rupture,${report.data.inventory.outOfStock}`);
  lines.push(`Stock faible,${report.data.inventory.lowStock}`);
  lines.push('');

  // Clients
  lines.push('CLIENTS');
  lines.push('Indicateur,Valeur');
  lines.push(`Total clients,${report.data.clients.totalClients}`);
  lines.push(`Nouveaux clients,${report.data.clients.newClients}`);
  lines.push(`Clients actifs,${report.data.clients.activeClients}`);
  lines.push(`Dettes totales,${report.data.clients.totalDebt} FCFA`);
  lines.push('');

  // Top clients
  if (report.data.clients.topClients.length > 0) {
    lines.push('TOP CLIENTS');
    lines.push('Client,CA (FCFA),Achats,Dette (FCFA)');
    report.data.clients.topClients.forEach(c => {
      lines.push(`"${c.clientName}",${c.revenue},${c.purchaseCount},${c.debt}`);
    });
    lines.push('');
  }

  // Commandes
  lines.push('COMMANDES FOURNISSEURS');
  lines.push('Indicateur,Valeur');
  lines.push(`Nombre de commandes,${report.data.orders.totalOrders}`);
  lines.push(`Total estimé,${report.data.orders.estimatedTotal} FCFA`);
  lines.push(`Total réel,${report.data.orders.actualTotal} FCFA`);
  lines.push(`Écart,${report.data.orders.priceVariance} FCFA`);
  lines.push('');

  // Finances
  lines.push('FINANCES');
  lines.push('Indicateur,Valeur');
  lines.push(`Marge brute,${report.data.finances.grossProfit} FCFA`);
  lines.push(`Taux de marge,${report.data.finances.profitMargin.toFixed(2)}%`);
  lines.push(`Encaissements,${report.data.finances.cashReceived} FCFA`);
  lines.push(`Ventes à crédit,${report.data.finances.creditSales} FCFA`);
  lines.push('');

  // Comparaison
  if (report.comparison?.changes) {
    lines.push('COMPARAISON PÉRIODE PRÉCÉDENTE');
    lines.push('Indicateur,Évolution (%)');
    lines.push(`Chiffre d'affaires,${report.comparison.changes.revenue.percentage.toFixed(2)}`);
    lines.push(`Nombre de ventes,${report.comparison.changes.sales.percentage.toFixed(2)}`);
    lines.push(`Clients actifs,${report.comparison.changes.clients.percentage.toFixed(2)}`);
    lines.push(`Marge,${report.comparison.changes.profitMargin.percentage.toFixed(2)}`);
    lines.push(`Valeur stock,${report.comparison.changes.inventory.percentage.toFixed(2)}`);
  }

  return lines.join('\n');
}

/**
 * Télécharge le CSV
 */
export function downloadReportCSV(report, filename) {
  const csv = generateReportCSV(report);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Retourne le CSV en string pour API
 */
export function getReportCSVString(report) {
  return generateReportCSV(report);
}