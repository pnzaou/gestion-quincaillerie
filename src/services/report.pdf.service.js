import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPeriod, formatReportType } from '@/helpers/report.helpers';

/**
 * Génère un PDF professionnel du rapport
 */
export async function generateReportPDF(report) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Helper pour ajouter du texte
  const addText = (text, x, y, fontSize = 12, style = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);
    doc.text(text, x, y);
  };

  // Header
  doc.setFillColor(0, 132, 209); // Bleu #0084D1
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  addText('RAPPORT DE GESTION', pageWidth / 2, 15, 20, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('RAPPORT DE GESTION', pageWidth / 2, 15, { align: 'center' });
  
  addText(report.reference, pageWidth / 2, 25, 12, 'normal');
  doc.text(report.reference, pageWidth / 2, 25, { align: 'center' });
  
  addText(formatPeriod(report.startDate, report.endDate), pageWidth / 2, 32, 10, 'normal');
  doc.text(formatPeriod(report.startDate, report.endDate), pageWidth / 2, 32, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPos = 50;

  // Informations générales
  addText(`Type: ${formatReportType(report.type)}`, 15, yPos, 11, 'normal');
  yPos += 7;
  addText(`Généré le: ${new Date(report.generatedAt).toLocaleDateString('fr-FR')}`, 15, yPos, 11, 'normal');
  yPos += 7;
  if (report.generatedBy) {
    addText(`Par: ${report.generatedBy.prenom} ${report.generatedBy.nom}`, 15, yPos, 11, 'normal');
  }
  yPos += 15;

  // Section Ventes
  addText('VENTES', 15, yPos, 14, 'bold');
  yPos += 8;

  const salesData = [
    ['Chiffre d\'affaires', `${report.data.sales.totalRevenue.toLocaleString('fr-FR')} FCFA`],
    ['Nombre de ventes', report.data.sales.totalSales.toString()],
    ['Panier moyen', `${report.data.sales.averageSale.toLocaleString('fr-FR')} FCFA`],
    ['Remises totales', `${report.data.sales.discount.toLocaleString('fr-FR')} FCFA`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indicateur', 'Valeur']],
    body: salesData,
    theme: 'striped',
    headStyles: { fillColor: [0, 132, 209] },
    margin: { left: 15, right: 15 },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Ventes par statut
  addText('Ventes par statut', 15, yPos, 12, 'bold');
  yPos += 5;

  const statusData = [
    ['Payées', report.data.sales.byStatus.paid.count, `${report.data.sales.byStatus.paid.amount.toLocaleString('fr-FR')} FCFA`],
    ['En attente', report.data.sales.byStatus.pending.count, `${report.data.sales.byStatus.pending.amount.toLocaleString('fr-FR')} FCFA`],
    ['Partielles', report.data.sales.byStatus.partial.count, `${report.data.sales.byStatus.partial.amount.toLocaleString('fr-FR')} FCFA`],
    ['Annulées', report.data.sales.byStatus.cancelled.count, `${report.data.sales.byStatus.cancelled.amount.toLocaleString('fr-FR')} FCFA`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Statut', 'Nombre', 'Montant']],
    body: statusData,
    theme: 'grid',
    margin: { left: 15, right: 15 },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Top produits
  if (report.data.sales.topProducts.length > 0) {
    addText('Top 5 produits', 15, yPos, 12, 'bold');
    yPos += 5;

    const topProductsData = report.data.sales.topProducts.slice(0, 5).map(p => [
      p.productName,
      p.quantity,
      `${p.revenue.toLocaleString('fr-FR')} FCFA`,
      `${p.profit.toLocaleString('fr-FR')} FCFA`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Produit', 'Qté', 'CA', 'Marge']],
      body: topProductsData,
      theme: 'striped',
      margin: { left: 15, right: 15 },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Nouvelle page si besoin
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Section Stock
  addText('STOCK', 15, yPos, 14, 'bold');
  yPos += 8;

  const inventoryData = [
    ['Valeur totale stock', `${report.data.inventory.totalValue.toLocaleString('fr-FR')} FCFA`],
    ['Nombre de produits', report.data.inventory.totalProducts.toString()],
    ['En rupture', report.data.inventory.outOfStock.toString()],
    ['Stock faible', report.data.inventory.lowStock.toString()],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indicateur', 'Valeur']],
    body: inventoryData,
    theme: 'striped',
    headStyles: { fillColor: [0, 132, 209] },
    margin: { left: 15, right: 15 },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Section Clients
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  addText('CLIENTS', 15, yPos, 14, 'bold');
  yPos += 8;

  const clientsData = [
    ['Total clients', report.data.clients.totalClients.toString()],
    ['Nouveaux clients', report.data.clients.newClients.toString()],
    ['Clients actifs', report.data.clients.activeClients.toString()],
    ['Dettes totales', `${report.data.clients.totalDebt.toLocaleString('fr-FR')} FCFA`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indicateur', 'Valeur']],
    body: clientsData,
    theme: 'striped',
    headStyles: { fillColor: [0, 132, 209] },
    margin: { left: 15, right: 15 },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Section Finances
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  addText('FINANCES', 15, yPos, 14, 'bold');
  yPos += 8;

  const financesData = [
    ['Marge brute', `${report.data.finances.grossProfit.toLocaleString('fr-FR')} FCFA`],
    ['Taux de marge', `${report.data.finances.profitMargin.toFixed(2)}%`],
    ['Encaissements', `${report.data.finances.cashReceived.toLocaleString('fr-FR')} FCFA`],
    ['Ventes à crédit', `${report.data.finances.creditSales.toLocaleString('fr-FR')} FCFA`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indicateur', 'Valeur']],
    body: financesData,
    theme: 'striped',
    headStyles: { fillColor: [0, 132, 209] },
    margin: { left: 15, right: 15 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Comparaison période précédente
  if (report.comparison?.changes) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    addText('COMPARAISON PÉRIODE PRÉCÉDENTE', 15, yPos, 14, 'bold');
    yPos += 8;

    const comparisonData = [
      [
        'Chiffre d\'affaires',
        `${report.comparison.changes.revenue.percentage > 0 ? '↗' : '↘'} ${Math.abs(report.comparison.changes.revenue.percentage).toFixed(1)}%`
      ],
      [
        'Nombre de ventes',
        `${report.comparison.changes.sales.percentage > 0 ? '↗' : '↘'} ${Math.abs(report.comparison.changes.sales.percentage).toFixed(1)}%`
      ],
      [
        'Clients actifs',
        `${report.comparison.changes.clients.percentage > 0 ? '↗' : '↘'} ${Math.abs(report.comparison.changes.clients.percentage).toFixed(1)}%`
      ],
      [
        'Marge',
        `${report.comparison.changes.profitMargin.percentage > 0 ? '↗' : '↘'} ${Math.abs(report.comparison.changes.profitMargin.percentage).toFixed(1)}%`
      ],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Indicateur', 'Évolution']],
      body: comparisonData,
      theme: 'grid',
      margin: { left: 15, right: 15 },
    });
  }

  // Footer sur toutes les pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Télécharge le PDF
 */
export async function downloadReportPDF(report, filename) {
  const doc = await generateReportPDF(report);
  doc.save(filename);
}

/**
 * Retourne le PDF en blob pour upload/email
 */
export async function getReportPDFBlob(report) {
  const doc = await generateReportPDF(report);
  return doc.output('blob');
}