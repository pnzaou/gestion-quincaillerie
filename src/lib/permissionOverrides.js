import UserPermissionOverrides from "@/models/UserPermissionOverrides.model";
import { ROLE_PERMISSIONS } from "./permissions";

/**
 * Récupère les overrides actifs d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} businessId - ID de la boutique
 * @returns {Object|null} - Overrides ou null
 */
export async function getUserOverrides(userId, businessId) {
  try {
    const overrides = await UserPermissionOverrides.findOne({
      user: userId,
      business: businessId,
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    return overrides;
  } catch (error) {
    console.error("Erreur getUserOverrides:", error);
    return null;
  }
}

/**
 * Vérifie si un utilisateur a une permission spécifique (avec overrides)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {string} businessId - ID de la boutique
 * @param {string} resource - Ressource (ex: 'products')
 * @param {string} action - Action (ex: 'create')
 * @returns {Promise<boolean>}
 */
export async function hasPermissionWithOverrides(userId, userRole, businessId, resource, action) {
  if (!userId || !userRole || !resource || !action) {
    return false;
  }

  // 1. Récupérer les overrides de l'utilisateur
  const overrides = await getUserOverrides(userId, businessId);

  // 2. Vérifier les permissions RETIRÉES (priorité max)
  if (overrides?.removedPermissions) {
    const removedMap = overrides.removedPermissions;
    if (removedMap instanceof Map) {
      const removedActions = removedMap.get(resource) || [];
      if (removedActions.includes(action)) {
        return false; // ❌ Permission explicitement retirée
      }
    } else if (typeof removedMap === 'object') {
      // Support pour objet simple (si pas Map)
      const removedActions = removedMap[resource] || [];
      if (removedActions.includes(action)) {
        return false; // ❌ Permission explicitement retirée
      }
    }
  }

  // 3. Vérifier les permissions AJOUTÉES (priorité haute)
  if (overrides?.addedPermissions) {
    const addedMap = overrides.addedPermissions;
    if (addedMap instanceof Map) {
      const addedActions = addedMap.get(resource) || [];
      if (addedActions.includes(action)) {
        return true; // ✅ Permission ajoutée via override
      }
    } else if (typeof addedMap === 'object') {
      // Support pour objet simple (si pas Map)
      const addedActions = addedMap[resource] || [];
      if (addedActions.includes(action)) {
        return true; // ✅ Permission ajoutée via override
      }
    }
  }

  // 4. Fallback : vérifier les permissions du rôle (hardcodées)
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

/**
 * Vérifie si un utilisateur peut accéder à une ressource (au moins une action)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {string} businessId - ID de la boutique
 * @param {string} resource - Ressource
 * @returns {Promise<boolean>}
 */
export async function canAccessResourceWithOverrides(userId, userRole, businessId, resource) {
  if (!userId || !userRole || !resource) {
    return false;
  }

  // Récupérer les overrides
  const overrides = await getUserOverrides(userId, businessId);

  // Vérifier si des permissions ont été ajoutées pour cette ressource
  if (overrides?.addedPermissions) {
    const addedMap = overrides.addedPermissions;
    let hasAddedPermissions = false;

    if (addedMap instanceof Map) {
      hasAddedPermissions = (addedMap.get(resource) || []).length > 0;
    } else if (typeof addedMap === 'object') {
      hasAddedPermissions = (addedMap[resource] || []).length > 0;
    }

    if (hasAddedPermissions) return true;
  }

  // Fallback : vérifier les permissions du rôle
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  return resourcePermissions && resourcePermissions.length > 0;
}

/**
 * Obtient toutes les permissions effectives d'un utilisateur (rôle + overrides)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {string} businessId - ID de la boutique
 * @returns {Promise<Object>} - Permissions effectives
 */
export async function getEffectivePermissions(userId, userRole, businessId) {
  // Démarrer avec les permissions du rôle
  const rolePermissions = ROLE_PERMISSIONS[userRole] || {};
  const effectivePermissions = { ...rolePermissions };

  // Récupérer les overrides
  const overrides = await getUserOverrides(userId, businessId);

  if (!overrides) {
    return effectivePermissions;
  }

  // Appliquer les permissions ajoutées
  if (overrides.addedPermissions) {
    const addedMap = overrides.addedPermissions instanceof Map 
      ? Object.fromEntries(overrides.addedPermissions)
      : overrides.addedPermissions;

    for (const [resource, actions] of Object.entries(addedMap)) {
      if (!effectivePermissions[resource]) {
        effectivePermissions[resource] = [];
      }
      // Ajouter les actions sans doublons
      effectivePermissions[resource] = [
        ...new Set([...effectivePermissions[resource], ...actions])
      ];
    }
  }

  // Appliquer les permissions retirées
  if (overrides.removedPermissions) {
    const removedMap = overrides.removedPermissions instanceof Map
      ? Object.fromEntries(overrides.removedPermissions)
      : overrides.removedPermissions;

    for (const [resource, actions] of Object.entries(removedMap)) {
      if (effectivePermissions[resource]) {
        // Retirer les actions
        effectivePermissions[resource] = effectivePermissions[resource].filter(
          action => !actions.includes(action)
        );
        // Supprimer la ressource si plus aucune action
        if (effectivePermissions[resource].length === 0) {
          delete effectivePermissions[resource];
        }
      }
    }
  }

  return effectivePermissions;
}