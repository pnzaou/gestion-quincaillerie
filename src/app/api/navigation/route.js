import { NextResponse } from "next/server";
import { withAuth } from "@/utils/withAuth";
import { ACTIONS, RESOURCES } from "@/lib/permissions";
import dbConnection from "@/lib/db";
import { getEffectivePermissions } from "@/lib/permissionOverrides";

/**
 * Configuration des liens (dupliquée depuis dashboardLinks.js)
 * TODO: Externaliser dans un fichier config partagé
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
      const accessibleLinks = NAVIGATION_CONFIG
        .filter(link => {
          // Vérifier si l'utilisateur a AU MOINS UNE action sur cette ressource
          const resourcePerms = effectivePermissions[link.resource];
          return resourcePerms && resourcePerms.length > 0;
        })
        .map(link => {
          // Filtrer les sous-liens
          const filteredSubLinks = (link.subLinks || [])
            .filter(subLink => {
              if (!subLink.requiredAction) return true;
              
              const resourcePerms = effectivePermissions[link.resource];
              return resourcePerms && resourcePerms.includes(subLink.requiredAction);
            });

          return {
            name: link.name,
            resource: link.resource,
            subLinks: filteredSubLinks.map(sub => ({ name: sub.name }))
          };
        });

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
    roles: ["admin", "gerant", "comptable", "vendeur"] // Tous les rôles connectés
  }
);