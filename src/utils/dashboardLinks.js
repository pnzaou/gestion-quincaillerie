import { ACTIONS, canAccessResource, RESOURCES } from "@/lib/permissions";
import {
    AdjustmentsHorizontalIcon,
    ListBulletIcon,
    UserGroupIcon,
    BanknotesIcon,
    Cog6ToothIcon
} from "@heroicons/react/24/outline"
import { FileText, LayoutDashboard, Truck } from "lucide-react"

/**
 * Configuration des liens de navigation
 * Chaque lien est associé à une ressource pour vérification des permissions
 */
const NAVIGATION_CONFIG = [
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
    name: "Clients",
    href: (shopId) => `/shop/${shopId}/dashboard/client`,
    icon: UserGroupIcon,
    resource: RESOURCES.CLIENTS,
    subLinks: [],
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
];

/**
 * Filtre les sous-liens selon les permissions de l'utilisateur
 * @param {Array} subLinks - Sous-liens du lien parent
 * @param {string} resource - Ressource du lien parent
 * @param {string} role - Rôle de l'utilisateur
 * @param {string} shopId - ID de la boutique
 * @returns {Array} - Sous-liens filtrés
 */
function filterSubLinks(subLinks, resource, role, shopId) {
  if (!subLinks || subLinks.length === 0) return [];
  
  return subLinks
    .filter(subLink => {
      // Si pas d'action requise, on affiche le sous-lien
      if (!subLink.requiredAction) return true;
      
      // Sinon, on vérifie la permission
      const { hasPermission } = require("@/lib/permissions");
      return hasPermission(role, resource, subLink.requiredAction);
    })
    .map(subLink => ({
      ...subLink,
      href: typeof subLink.href === 'function' ? subLink.href(shopId) : subLink.href
    }));
}

/**
 * Génère les liens de navigation selon les permissions de l'utilisateur
 * @param {string} shopId - ID de la boutique
 * @param {string} role - Rôle de l'utilisateur
 * @returns {Array} - Liste des liens accessibles
 */
export const getLinks = (shopId = null, role = null) => {
  if (!shopId || !role) {
    return [];
  }

  return NAVIGATION_CONFIG
    .filter(link => {
      // Vérifier si l'utilisateur peut accéder à la ressource
      return canAccessResource(role, link.resource);
    })
    .map(link => {
      // Filtrer les sous-liens selon les permissions
      const filteredSubLinks = filterSubLinks(link.subLinks, link.resource, role, shopId);

      return {
        ...link,
        href: typeof link.href === 'function' ? link.href(shopId) : link.href,
        subLinks: filteredSubLinks
      };
    })
    // Ne garder que les liens qui ont soit pas de sous-liens, soit des sous-liens accessibles
    .filter(link => link.subLinks.length === 0 || link.subLinks.length > 0);
}; 

export const links = getLinks();