import { ACTIONS, canAccessResource, hasPermission, RESOURCES } from "@/lib/permissions";
import {
    AdjustmentsHorizontalIcon,
    ListBulletIcon,
    UserGroupIcon,
    BanknotesIcon,
    Cog6ToothIcon
} from "@heroicons/react/24/outline"
import { FileText, LayoutDashboard, Truck, BarChart3 } from "lucide-react"

/**
 * Configuration des liens de navigation
 * Chaque lien est associé à une ressource pour vérification des permissions
 */
export const NAVIGATION_CONFIG = [
  {
    name: "Dashboard",
    href: (shopId) => `/shop/${shopId}/dashboard`,
    icon: AdjustmentsHorizontalIcon,
    resource: RESOURCES.DASHBOARD,
    subLinks: []
  },
  {
    name: "Catégories",
    href: (shopId) => `/shop/${shopId}/dashboard/categorie`,
    icon: LayoutDashboard,
    resource: RESOURCES.CATEGORIES,
    subLinks: [
      { 
        name: "Ajouter", 
        href: (shopId) => `/shop/${shopId}/dashboard/categorie/ajouter`,
        requiredAction: ACTIONS.CREATE,
      },
      { 
        name: "Liste", 
        href: (shopId) => `/shop/${shopId}/dashboard/categorie/liste`,
        requiredAction: ACTIONS.LIST,
      }
    ],
  },
  {
    name: "Articles",
    href: (shopId) => `/shop/${shopId}/dashboard/article`,
    icon: ListBulletIcon,
    resource: RESOURCES.PRODUCTS,
    subLinks: [
      { 
        name: "Ajouter", 
        href: (shopId) => `/shop/${shopId}/dashboard/article/ajouter`,
        requiredAction: ACTIONS.CREATE,
      },
      { 
        name: "Stock", 
        href: (shopId) => `/shop/${shopId}/dashboard/article/stock`,
        requiredAction: ACTIONS.LIST,
      }
    ],
  },
  {
    name: "Ventes",
    href: (shopId) => `/shop/${shopId}/dashboard/vente`,
    icon: BanknotesIcon,
    resource: RESOURCES.SALES,
    subLinks: [
      { 
        name: "Effectuer une vente", 
        href: (shopId) => `/shop/${shopId}/dashboard/vente/vendre`,
        requiredAction: ACTIONS.CREATE,
      },
      { 
        name: "Historique des ventes", 
        href: (shopId) => `/shop/${shopId}/dashboard/vente/historique-vente`,
        requiredAction: ACTIONS.LIST,
      },
    ],
  },
  {
    name: "Devis",
    href: (shopId) => `/shop/${shopId}/dashboard/devis`,
    icon: FileText,
    resource: RESOURCES.SALES, // ✅ Utilise SALES (pas QUOTES car pas défini)
    subLinks: [],
  },
  {
    name: "Clients",
    href: (shopId) => `/shop/${shopId}/dashboard/client`,
    icon: UserGroupIcon,
    resource: RESOURCES.CLIENTS,
    subLinks: [],
  },
  {
    name: "Commandes",
    href: (shopId) => `/shop/${shopId}/dashboard/commande`,
    icon: FileText,
    resource: RESOURCES.ORDERS,
    subLinks: [
      { 
        name: "Nouvelle commande", 
        href: (shopId) => `/shop/${shopId}/dashboard/commande/ajouter`,
        requiredAction: ACTIONS.CREATE,
      },
      { 
        name: "Liste", 
        href: (shopId) => `/shop/${shopId}/dashboard/commande/historique`,
        requiredAction: ACTIONS.LIST,
      },
    ],
  },
  {
    name: "Fournisseurs",
    href: (shopId) => `/shop/${shopId}/dashboard/fournisseurs`,
    icon: Truck,
    resource: RESOURCES.SUPPLIERS,
    subLinks: [
      { 
        name: "Ajouter", 
        href: (shopId) => `/shop/${shopId}/dashboard/fournisseurs/ajouter`,
        requiredAction: ACTIONS.CREATE,
      },
      { 
        name: "Liste", 
        href: (shopId) => `/shop/${shopId}/dashboard/fournisseurs/liste`,
        requiredAction: ACTIONS.LIST,
      },
    ],
  },
  {
    name: "Rapports",
    href: (shopId) => `/shop/${shopId}/dashboard/rapports`,
    icon: BarChart3,
    resource: RESOURCES.REPORTS,
    subLinks: [],
  },
];

/**
 * Génère les liens de navigation selon les permissions hardcodées du rôle
 * Version SYNCHRONE - utilisée pour l'affichage initial côté client
 * Les overrides sont gérés via /api/navigation
 * 
 * @param {string} shopId - ID de la boutique
 * @param {string} role - Rôle de l'utilisateur
 * @returns {Array} - Liste des liens accessibles (permissions hardcodées uniquement)
 */
export const getLinks = (shopId = null, role = null) => {
  if (!shopId || !role) {
    return [];
  }

  return NAVIGATION_CONFIG
    .filter(link => {
      // Vérifier si l'utilisateur peut accéder à la ressource (hardcodé)
      return canAccessResource(role, link.resource);
    })
    .map(link => {
      // Filtrer les sous-liens selon les permissions (hardcodées)
      const filteredSubLinks = (link.subLinks || [])
        .filter(subLink => {
          if (!subLink.requiredAction) return true;
          return hasPermission(role, link.resource, subLink.requiredAction);
        })
        .map(subLink => ({
          ...subLink,
          href: typeof subLink.href === 'function' ? subLink.href(shopId) : subLink.href
        }));

      return {
        ...link,
        href: typeof link.href === 'function' ? link.href(shopId) : link.href,
        subLinks: filteredSubLinks,
        icon: link.icon
      };
    })
    .filter(link => link.subLinks.length === 0 || link.subLinks.length > 0);
};

export const links = getLinks();