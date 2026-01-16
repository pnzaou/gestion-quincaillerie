// Formatage des montants en FCFA
export const formatCurrency = (amount) => {
  return (
    new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA'
  );
};

// Formatage des montants courts (pour les KPI)
export const formatCurrencyShort = (amount) => {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.0', '') + 'M FCFA';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + 'K FCFA';
  }
  return formatCurrency(amount);
};

// Formatage des dates
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

// Formatage date complète avec heure
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Formatage d'une période
export const formatPeriod = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startStr = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
  }).format(startDate);

  const endStr = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(endDate);

  return `${startStr} - ${endStr}`;
};

// Formatage des pourcentages avec signe
export const formatPercentage = (value) => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

// Formatage des pourcentages simples
export const formatPercent = (value) => {
  return `${value.toFixed(1)}%`;
};

// Formatage des nombres
export const formatNumber = (value) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};
