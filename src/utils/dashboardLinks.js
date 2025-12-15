import {
    AdjustmentsHorizontalIcon,
    ListBulletIcon,
    UserGroupIcon,
    BanknotesIcon,
    Cog6ToothIcon
} from "@heroicons/react/24/outline"
import { FileText, LayoutDashboard, Truck } from "lucide-react"

export const getLinks = (shopId = null) => {
  if (!shopId) {
    return [];
  }

  return [
    {
      name: "Dashboard",
      href: `/shop/${shopId}/dashboard`,
      icon: AdjustmentsHorizontalIcon,
      roles: ["admin", "gerant", "comptable"],
      subLinks: [],
    },
    {
      name: "Catégories",
      href: `/shop/${shopId}/dashboard/categorie`,
      icon: LayoutDashboard,
      roles: ["admin", "gerant"],
      subLinks: [
        { name: "Ajouter", href: `/shop/${shopId}/dashboard/categorie/ajouter` },
        { name: "Liste", href: `/shop/${shopId}/dashboard/categorie/liste` }
      ],
    },
    {
      name: "Articles",
      href: `/shop/${shopId}/dashboard/article`,
      icon: ListBulletIcon,
      roles: ["admin", "gerant"],
      subLinks: [
        { name: "Ajouter", href: `/shop/${shopId}/dashboard/article/ajouter` },
        { name: "Stock", href: `/shop/${shopId}/dashboard/article/stock` }
      ],
    },
    {
      name: "Clients",
      href: `/shop/${shopId}/dashboard/client`,
      icon: UserGroupIcon,
      roles: ["admin", "gerant"],
      subLinks: [],
    },
    {
      name: "Ventes",
      href: `/shop/${shopId}/dashboard/vente`,
      icon: BanknotesIcon,
      roles: ["admin", "gerant"],
      subLinks: [
        { name: "Effectuer une vente", href: `/shop/${shopId}/dashboard/vente/vendre` },
        { name: "Historique des ventes", href: `/shop/${shopId}/dashboard/vente/historique-vente` },
      ],
    },
    {
      name: "Commandes",
      href: `/shop/${shopId}/dashboard/commande`,
      icon: FileText,
      roles: ["admin", "gerant", "comptable"],
      subLinks: [
        { name: "Nouvelle commande", href: `/shop/${shopId}/dashboard/commande/ajouter` },
        { name: "Liste", href: `/shop/${shopId}/dashboard/commande/historique` },
      ],
    },
    {
      name: "Fournisseurs",
      href: `/shop/${shopId}/dashboard/fournisseurs`,
      icon: Truck,
      roles: ["admin", "gerant", "comptable"],
      subLinks: [
        { name: "Ajouter", href: `/shop/${shopId}/dashboard/fournisseurs/ajouter` },
        { name: "Liste", href: `/shop/${shopId}/dashboard/fournisseurs/liste` },
      ],
    },
    {
      name: "Réglages",
      href: `/shop/${shopId}/dashboard/reglages`,
      icon: Cog6ToothIcon,
      roles: ["admin", "gerant"],
      subLinks: [],
    }
  ];
}; 

export const links = getLinks();