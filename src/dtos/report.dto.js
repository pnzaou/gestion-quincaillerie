export const REPORT_TYPES = ["daily", "weekly", "monthly", "quarterly", "yearly", "custom"];
export const REPORT_STATUSES = ["draft", "finalized", "archived"];

/**
 * Valide le payload de génération de rapport
 */
export function validateGenerateReportPayload(raw) {
  const errors = [];

  const payload = {
    businessId: raw.businessId,
    type: raw.type,
    startDate: raw.startDate ? new Date(raw.startDate) : null,
    endDate: raw.endDate ? new Date(raw.endDate) : null,
    notes: raw.notes || ""
  };

  // Validation businessId
  if (!payload.businessId) {
    errors.push("businessId est obligatoire.");
  }

  // Validation type
  if (!payload.type || !REPORT_TYPES.includes(payload.type)) {
    errors.push(`type invalide. Valeurs acceptées: ${REPORT_TYPES.join(", ")}`);
  }

  // Validation dates pour custom
  if (payload.type === "custom") {
    if (!payload.startDate || isNaN(payload.startDate.getTime())) {
      errors.push("startDate est obligatoire et doit être une date valide pour type 'custom'.");
    }
    if (!payload.endDate || isNaN(payload.endDate.getTime())) {
      errors.push("endDate est obligatoire et doit être une date valide pour type 'custom'.");
    }
    if (payload.startDate && payload.endDate && payload.startDate > payload.endDate) {
      errors.push("startDate doit être antérieure à endDate.");
    }
  }

  return { valid: errors.length === 0, errors, payload };
}

/**
 * Valide le payload de mise à jour de rapport
 */
export function validateUpdateReportPayload(raw) {
  const errors = [];

  const payload = {
    status: raw.status,
    notes: raw.notes
  };

  // Validation status
  if (payload.status && !REPORT_STATUSES.includes(payload.status)) {
    errors.push(`status invalide. Valeurs acceptées: ${REPORT_STATUSES.join(", ")}`);
  }

  return { valid: errors.length === 0, errors, payload };
}