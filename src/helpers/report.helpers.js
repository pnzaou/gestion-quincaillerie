/**
 * Calcule les dates pour un type de rapport donné
 */
export function getReportDates(type, customStartDate = null, customEndDate = null) {
  const now = new Date();
  let startDate, endDate;

  switch (type) {
    case "daily":
      // Aujourd'hui de 00:00:00 à 23:59:59
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;

    case "weekly":
      // Semaine glissante (7 derniers jours)
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "monthly":
      // Mois en cours (1er au dernier jour)
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;

    case "quarterly":
      // Trimestre en cours
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const quarterStartMonth = currentQuarter * 3;
      startDate = new Date(now.getFullYear(), quarterStartMonth, 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59);
      break;

    case "yearly":
      // Année en cours
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;

    case "custom":
      if (!customStartDate || !customEndDate) {
        throw new Error("Les dates personnalisées sont requises pour le type 'custom'");
      }
      startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      throw new Error("Type de rapport invalide");
  }

  return { startDate, endDate };
}

/**
 * Valide les dates personnalisées
 */
export function validateCustomDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: "Dates invalides" };
  }

  if (start > end) {
    return { valid: false, error: "La date de début doit être antérieure à la date de fin" };
  }

  // Limite 2 ans max
  const maxDuration = 2 * 365 * 24 * 60 * 60 * 1000; // 2 ans en ms
  if (end - start > maxDuration) {
    return { valid: false, error: "La période ne peut pas dépasser 2 ans" };
  }

  return { valid: true };
}

/**
 * Formatte un type de rapport pour affichage
 */
export function formatReportType(type) {
  const types = {
    daily: "Quotidien",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    quarterly: "Trimestriel",
    yearly: "Annuel",
    custom: "Personnalisé"
  };
  return types[type] || type;
}

/**
 * Formatte une période pour affichage
 */
export function formatPeriod(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const startStr = start.toLocaleDateString('fr-FR', options);
  const endStr = end.toLocaleDateString('fr-FR', options);
  
  return `${startStr} - ${endStr}`;
}

/**
 * Génère un nom de fichier pour export
 */
export function generateExportFileName(report, extension = "pdf") {
  const start = new Date(report.startDate);
  const end = new Date(report.endDate);
  
  const dateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  const typeStr = formatReportType(report.type).toLowerCase().replace(/\s+/g, '_');
  
  return `rapport_${typeStr}_${dateStr}_${report.reference}.${extension}`;
}