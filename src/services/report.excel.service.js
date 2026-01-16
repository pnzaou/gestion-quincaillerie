import { formatPeriod } from '@/helpers/report.helpers';
import ExcelJS from 'exceljs';

/**
 * Génère un fichier Excel avec graphiques
 */
export async function generateReportExcel(report) {
  const workbook = new ExcelJS.Workbook();
  
  workbook.creator = report.generatedBy?.prenom + ' ' + report.generatedBy?.nom || 'Système';
  workbook.created = new Date(report.generatedAt);
  workbook.modified = new Date();

  // ===== Feuille Résumé =====
  const summarySheet = workbook.addWorksheet('Résumé', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 3 }]
  });

  // Header
  summarySheet.mergeCells('A1:D1');
  summarySheet.getCell('A1').value = 'RAPPORT DE GESTION';
  summarySheet.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A1').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0084D1' }
  };
  summarySheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(1).height = 30;

  summarySheet.getCell('A2').value = report.reference;
  summarySheet.getCell('A2').font = { bold: true };
  summarySheet.getCell('A3').value = formatPeriod(report.startDate, report.endDate);

  // Ventes
  let row = 5;
  summarySheet.getCell(`A${row}`).value = 'VENTES';
  summarySheet.getCell(`A${row}`).font = { size: 14, bold: true };
  summarySheet.getCell(`A${row}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  row++;

  const salesData = [
    ['Chiffre d\'affaires', report.data.sales.totalRevenue, 'FCFA'],
    ['Nombre de ventes', report.data.sales.totalSales, ''],
    ['Panier moyen', report.data.sales.averageSale, 'FCFA'],
    ['Remises', report.data.sales.discount, 'FCFA'],
  ];

  salesData.forEach(([label, value, unit]) => {
    summarySheet.getCell(`A${row}`).value = label;
    summarySheet.getCell(`B${row}`).value = value;
    summarySheet.getCell(`C${row}`).value = unit;
    row++;
  });

  row++;

  // Stock
  summarySheet.getCell(`A${row}`).value = 'STOCK';
  summarySheet.getCell(`A${row}`).font = { size: 14, bold: true };
  summarySheet.getCell(`A${row}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  row++;

  const inventoryData = [
    ['Valeur totale', report.data.inventory.totalValue, 'FCFA'],
    ['Nombre produits', report.data.inventory.totalProducts, ''],
    ['En rupture', report.data.inventory.outOfStock, ''],
    ['Stock faible', report.data.inventory.lowStock, ''],
  ];

  inventoryData.forEach(([label, value, unit]) => {
    summarySheet.getCell(`A${row}`).value = label;
    summarySheet.getCell(`B${row}`).value = value;
    summarySheet.getCell(`C${row}`).value = unit;
    row++;
  });

  row++;

  // Clients
  summarySheet.getCell(`A${row}`).value = 'CLIENTS';
  summarySheet.getCell(`A${row}`).font = { size: 14, bold: true };
  summarySheet.getCell(`A${row}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  row++;

  const clientsData = [
    ['Total clients', report.data.clients.totalClients, ''],
    ['Nouveaux', report.data.clients.newClients, ''],
    ['Actifs', report.data.clients.activeClients, ''],
    ['Dettes totales', report.data.clients.totalDebt, 'FCFA'],
  ];

  clientsData.forEach(([label, value, unit]) => {
    summarySheet.getCell(`A${row}`).value = label;
    summarySheet.getCell(`B${row}`).value = value;
    summarySheet.getCell(`C${row}`).value = unit;
    row++;
  });

  // Auto-width colonnes
  summarySheet.columns = [
    { width: 25 },
    { width: 20 },
    { width: 10 }
  ];

  // ===== Feuille Ventes par Statut =====
  const statusSheet = workbook.addWorksheet('Ventes par Statut');
  
  statusSheet.addRow(['Statut', 'Nombre', 'Montant (FCFA)']);
  statusSheet.getRow(1).font = { bold: true };
  statusSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0084D1' }
  };

  const statuses = ['paid', 'pending', 'partial', 'cancelled'];
  const statusLabels = {
    paid: 'Payées',
    pending: 'En attente',
    partial: 'Partielles',
    cancelled: 'Annulées'
  };

  statuses.forEach(status => {
    statusSheet.addRow([
      statusLabels[status],
      report.data.sales.byStatus[status].count,
      report.data.sales.byStatus[status].amount
    ]);
  });

  statusSheet.columns = [
    { width: 15 },
    { width: 12 },
    { width: 20 }
  ];

  // ===== Feuille Top Produits =====
  if (report.data.sales.topProducts.length > 0) {
    const productsSheet = workbook.addWorksheet('Top Produits');
    
    productsSheet.addRow(['Produit', 'Quantité', 'CA (FCFA)', 'Marge (FCFA)']);
    productsSheet.getRow(1).font = { bold: true };
    productsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0084D1' }
    };

    report.data.sales.topProducts.forEach(product => {
      productsSheet.addRow([
        product.productName,
        product.quantity,
        product.revenue,
        product.profit
      ]);
    });

    productsSheet.columns = [
      { width: 30 },
      { width: 12 },
      { width: 15 },
      { width: 15 }
    ];
  }

  // ===== Feuille Top Clients =====
  if (report.data.clients.topClients.length > 0) {
    const clientsSheet = workbook.addWorksheet('Top Clients');
    
    clientsSheet.addRow(['Client', 'CA (FCFA)', 'Achats', 'Dette (FCFA)']);
    clientsSheet.getRow(1).font = { bold: true };
    clientsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0084D1' }
    };

    report.data.clients.topClients.forEach(client => {
      clientsSheet.addRow([
        client.clientName,
        client.revenue,
        client.purchaseCount,
        client.debt
      ]);
    });

    clientsSheet.columns = [
      { width: 25 },
      { width: 15 },
      { width: 12 },
      { width: 15 }
    ];
  }

  // ===== Feuille Comparaison =====
  if (report.comparison?.changes) {
    const compSheet = workbook.addWorksheet('Comparaison');
    
    compSheet.addRow(['Indicateur', 'Évolution (%)', 'Tendance']);
    compSheet.getRow(1).font = { bold: true };
    compSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0084D1' }
    };

    const changes = [
      ['CA', report.comparison.changes.revenue.percentage],
      ['Ventes', report.comparison.changes.sales.percentage],
      ['Clients actifs', report.comparison.changes.clients.percentage],
      ['Marge', report.comparison.changes.profitMargin.percentage],
      ['Valeur stock', report.comparison.changes.inventory.percentage],
    ];

    changes.forEach(([label, percentage]) => {
      const trend = percentage > 0 ? '↗' : percentage < 0 ? '↘' : '→';
      compSheet.addRow([label, percentage.toFixed(2), trend]);
    });

    compSheet.columns = [
      { width: 20 },
      { width: 15 },
      { width: 10 }
    ];
  }

  return workbook;
}

/**
 * Télécharge le fichier Excel
 */
export async function downloadReportExcel(report, filename) {
  const workbook = await generateReportExcel(report);
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Browser download
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Retourne le buffer Excel pour API/email
 */
export async function getReportExcelBuffer(report) {
  const workbook = await generateReportExcel(report);
  return await workbook.xlsx.writeBuffer();
}