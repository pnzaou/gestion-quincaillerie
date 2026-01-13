// ============================================
// SYSTÈME DE PERMISSIONS RBAC
// ============================================

/**
 * RESSOURCES de l'application
 * Chaque ressource correspond à une entité métier
 */
export const RESOURCES = {
  DASHBOARD: 'dashboard',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  CLIENTS: 'clients',
  CLIENT_ACCOUNTS: 'client_accounts',
  SALES: 'sales',
  ORDERS: 'orders',
  SUPPLIERS: 'suppliers',
  USERS: 'users',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  REPORTS: 'reports',
  PAYMENTS: 'payments',
};

/**
 * ACTIONS possibles sur les ressources
 * CRUD + actions métier spécifiques
 */
export const ACTIONS = {
  // CRUD basique
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  
  // Actions spécifiques
  LIST: 'list',
  EXPORT: 'export',
  IMPORT: 'import',
  APPROVE: 'approve',
  CANCEL: 'cancel',
  VALIDATE: 'validate',

  // Actions dashboard (stats cards)
  VIEW_REVENUE_TODAY: 'view_revenue_today',
  VIEW_REVENUE_MONTH: 'view_revenue_month',
  VIEW_REVENUE_PREVIOUS_MONTH: 'view_revenue_previous_month',
  VIEW_REVENUE_YEAR: 'view_revenue_year',
  VIEW_SALES_COUNT: 'view_sales_count',
  VIEW_STOCK_ALERTS: 'view_stock_alerts',
  VIEW_ORDERS_PENDING: 'view_orders_pending',
  VIEW_DEBTS_TOTAL: 'view_debts_total',
};

/**
 * DÉFINITION DES RÔLES avec leurs permissions
 * Format : { resource: [actions autorisées] }
 */
export const ROLE_PERMISSIONS = {
  admin: {
    // Admin a TOUS les droits
    [RESOURCES.DASHBOARD]: [
      ACTIONS.READ,
      ACTIONS.VIEW_REVENUE_TODAY,
      ACTIONS.VIEW_REVENUE_MONTH,
      ACTIONS.VIEW_REVENUE_PREVIOUS_MONTH,
      ACTIONS.VIEW_REVENUE_YEAR,
      ACTIONS.VIEW_SALES_COUNT,
      ACTIONS.VIEW_STOCK_ALERTS,
      ACTIONS.VIEW_ORDERS_PENDING,
      ACTIONS.VIEW_DEBTS_TOTAL,
    ],
    [RESOURCES.CATEGORIES]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST, ACTIONS.EXPORT, ACTIONS.IMPORT],
    [RESOURCES.PRODUCTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST, ACTIONS.IMPORT, ACTIONS.EXPORT],
    [RESOURCES.CLIENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST, ACTIONS.EXPORT],
    [RESOURCES.CLIENT_ACCOUNTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.SALES]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST, ACTIONS.CANCEL, ACTIONS.EXPORT],
    [RESOURCES.ORDERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST, ACTIONS.APPROVE, ACTIONS.CANCEL],
    [RESOURCES.SUPPLIERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST],
    [RESOURCES.USERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST],
    [RESOURCES.NOTIFICATIONS]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST],
    [RESOURCES.SETTINGS]: [ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.REPORTS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.PAYMENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.LIST, ACTIONS.VALIDATE],
  },

  gerant: {
    // Gérant : gestion opérationnelle complète
    [RESOURCES.DASHBOARD]: [
      ACTIONS.READ,
      ACTIONS.VIEW_REVENUE_TODAY,
      ACTIONS.VIEW_REVENUE_MONTH,
      ACTIONS.VIEW_SALES_COUNT,
      ACTIONS.VIEW_STOCK_ALERTS,
      ACTIONS.VIEW_ORDERS_PENDING,
      ACTIONS.VIEW_DEBTS_TOTAL,
    ],
    [RESOURCES.CATEGORIES]: [ACTIONS.READ, ACTIONS.LIST],
    [RESOURCES.PRODUCTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST, ACTIONS.IMPORT, ACTIONS.EXPORT],
    [RESOURCES.CLIENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST, ACTIONS.EXPORT],
    [RESOURCES.CLIENT_ACCOUNTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.SALES]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.LIST, ACTIONS.EXPORT],
    [RESOURCES.ORDERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.LIST],
    [RESOURCES.SUPPLIERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.LIST],
    [RESOURCES.USERS]: [], // Pas d'accès aux utilisateurs
    [RESOURCES.NOTIFICATIONS]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.LIST],
    [RESOURCES.SETTINGS]: [ACTIONS.READ],
    [RESOURCES.REPORTS]: [ACTIONS.READ],
    [RESOURCES.PAYMENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.LIST],
  },

  comptable: {
    // Comptable : lecture + gestion commandes/fournisseurs
    [RESOURCES.DASHBOARD]: [
      ACTIONS.READ,
      ACTIONS.VIEW_REVENUE_TODAY,
      ACTIONS.VIEW_REVENUE_MONTH,
      ACTIONS.VIEW_REVENUE_PREVIOUS_MONTH,
      ACTIONS.VIEW_REVENUE_YEAR,
      ACTIONS.VIEW_SALES_COUNT,
      ACTIONS.VIEW_STOCK_ALERTS,
      ACTIONS.VIEW_ORDERS_PENDING,
      ACTIONS.VIEW_DEBTS_TOTAL,
    ],
    [RESOURCES.CATEGORIES]: [ACTIONS.READ, ACTIONS.LIST],
    [RESOURCES.PRODUCTS]: [ACTIONS.READ, ACTIONS.LIST, ACTIONS.EXPORT],
    [RESOURCES.CLIENTS]: [ACTIONS.READ, ACTIONS.LIST],
    [RESOURCES.CLIENT_ACCOUNTS]: [ACTIONS.READ],
    [RESOURCES.SALES]: [ACTIONS.READ, ACTIONS.LIST, ACTIONS.EXPORT],
    [RESOURCES.ORDERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.LIST, ACTIONS.APPROVE],
    [RESOURCES.SUPPLIERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.LIST],
    [RESOURCES.USERS]: [], // Pas d'accès
    [RESOURCES.NOTIFICATIONS]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.LIST],
    [RESOURCES.SETTINGS]: [], // Pas d'accès
    [RESOURCES.REPORTS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.PAYMENTS]: [ACTIONS.READ, ACTIONS.LIST, ACTIONS.VALIDATE],
  },

  // vendeur: {
  //   // Vendeur : uniquement ventes et clients (exemple pour futur rôle)
  //   [RESOURCES.DASHBOARD]: [ACTIONS.READ],
  //   [RESOURCES.PRODUCTS]: [ACTIONS.READ, ACTIONS.LIST],
  //   [RESOURCES.CLIENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.LIST],
  //   [RESOURCES.SALES]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.LIST],
  // },
};

/**
 * Vérifie si un rôle a une permission spécifique
 * @param {string} role - Rôle de l'utilisateur
 * @param {string} resource - Ressource (ex: 'products')
 * @param {string} action - Action (ex: 'create')
 * @returns {boolean}
 */
export function hasPermission(role, resource, action) {
  if (!role || !resource || !action) return false;
  
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

/**
 * Vérifie si un rôle peut accéder à une ressource (au moins une action)
 * @param {string} role - Rôle de l'utilisateur
 * @param {string} resource - Ressource
 * @returns {boolean}
 */
export function canAccessResource(role, resource) {
  if (!role || !resource) return false;
  
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const resourcePermissions = permissions[resource];
  return resourcePermissions && resourcePermissions.length > 0;
}

/**
 * Obtient toutes les permissions d'un rôle
 * @param {string} role - Rôle de l'utilisateur
 * @returns {object} - Permissions du rôle
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || {};
}

/**
 * Vérifie si un rôle peut effectuer TOUTES les actions fournies sur une ressource
 * @param {string} role - Rôle de l'utilisateur
 * @param {string} resource - Ressource
 * @param {string[]} actions - Liste d'actions à vérifier
 * @returns {boolean}
 */
export function hasAllPermissions(role, resource, actions) {
  return actions.every(action => hasPermission(role, resource, action));
}

/**
 * Vérifie si un rôle peut effectuer AU MOINS UNE des actions fournies sur une ressource
 * @param {string} role - Rôle de l'utilisateur
 * @param {string} resource - Ressource
 * @param {string[]} actions - Liste d'actions à vérifier
 * @returns {boolean}
 */
export function hasAnyPermission(role, resource, actions) {
  return actions.some(action => hasPermission(role, resource, action));
}