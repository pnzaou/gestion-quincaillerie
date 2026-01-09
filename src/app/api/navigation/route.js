import { NextResponse } from "next/server";
import { withAuth } from "@/utils/withAuth";
import { getEffectivePermissions } from "@/lib/permissionOverrides";
import { ACTIONS, RESOURCES } from "@/lib/permissions";
import dbConnection from "@/lib/db";

/**
 * Configuration des liens (dupliquée depuis dashboardLinks.js)
 */
const NAVIGATION_CONFIG = [
  {
    name: "Dashboard",
    resource: RESOURCES.DASHBOARD,
    subLinks: []
  },
  {
    name: "Catégories",
    resource: RESOURCES.CATEGORIES,
    subLinks: [
      { name: "Ajouter", requiredAction: ACTIONS.CREATE },
      { name: "Liste", requiredAction: ACTIONS.LIST }
    ],
  },
  {
    name: "Articles",
    resource: RESOURCES.PRODUCTS,
    subLinks: [
      { name: "Ajouter", requiredAction: ACTIONS.CREATE },
      { name: "Stock", requiredAction: ACTIONS.LIST }
    ],
  },
  {
    name: "Clients",
    resource: RESOURCES.CLIENTS,
    subLinks: [],
  },
  {
    name: "Ventes",
    resource: RESOURCES.SALES,
    subLinks: [
      { name: "Effectuer une vente", requiredAction: ACTIONS.CREATE },
      { name: "Historique des ventes", requiredAction: ACTIONS.LIST }
    ],
  },
  {
    name: "Commandes",
    resource: RESOURCES.ORDERS,
    subLinks: [
      { name: "Nouvelle commande", requiredAction: ACTIONS.CREATE },
      { name: "Liste", requiredAction: ACTIONS.LIST }
    ],
  },
  {
    name: "Fournisseurs",
    resource: RESOURCES.SUPPLIERS,
    subLinks: [
      { name: "Ajouter", requiredAction: ACTIONS.CREATE },
      { name: "Liste", requiredAction: ACTIONS.LIST }
    ],
  },
];

// ============================================
// GET - Récupérer les liens avec overrides
// ============================================
export const GET = withAuth(
  async (req, session) => {
    try {
      await dbConnection();

      const userId = session.user.id || session.user._id;
      const userRole = session.user.role;
      const businessId = session.user.business || null;

      // Récupérer TOUTES les permissions effectives (rôle + overrides)
      const effectivePermissions = await getEffectivePermissions(userId, userRole, businessId);

      // Filtrer les liens selon les permissions effectives
      const accessibleLinks = [];

      for (const link of NAVIGATION_CONFIG) {
        const resourcePerms = effectivePermissions[link.resource] || [];

        // Si pas de subLinks, vérifier si AU MOINS 1 action disponible
        if (link.subLinks.length === 0) {
          if (resourcePerms.length > 0) {
            accessibleLinks.push({
              name: link.name,
              resource: link.resource,
              subLinks: []
            });
          }
          continue;
        }

        // Filtrer les subLinks selon les actions disponibles
        const filteredSubLinks = link.subLinks.filter(subLink => {
          if (!subLink.requiredAction) return true;
          return resourcePerms.includes(subLink.requiredAction);
        });

        // ✅ FIX : N'afficher l'item QUE si au moins 1 subLink accessible
        if (filteredSubLinks.length > 0) {
          accessibleLinks.push({
            name: link.name,
            resource: link.resource,
            subLinks: filteredSubLinks.map(sub => ({ name: sub.name }))
          });
        }
      }

      return NextResponse.json(
        {
          success: true,
          data: accessibleLinks
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur GET /api/navigation:", error);
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: error.message || "Erreur serveur"
        },
        { status: 500 }
      );
    }
  },
  {
    roles: ["admin", "gerant", "comptable", "vendeur"]
  }
);