import {
    AdjustmentsHorizontalIcon,
    ListBulletIcon,
    UserGroupIcon,
    BanknotesIcon,
    Cog6ToothIcon
} from "@heroicons/react/24/outline"
import { FileText, LayoutDashboard, Truck } from "lucide-react"

export const links = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: AdjustmentsHorizontalIcon,
      roles: ["admin", "comptable"],
      subLinks: [],
    },
    {
      name: "Catégories",
      href: "/dashboard/categorie",
      icon: LayoutDashboard,
      roles: ["admin"],
      subLinks: [
        { name: "Ajouter", href: "/dashboard/categorie/ajouter" },
        { name: "Liste", href: "/dashboard/categorie/liste" }
      ],
    },
    {
      name: "Articles",
      href: "/dashboard/article",
      icon: ListBulletIcon,
      roles: ["admin"],
      subLinks: [
        { name: "Ajouter", href: "/dashboard/article/ajouter" },
        { name: "Stock", href: "/dashboard/article/stock" }
      ],
    },
    {
      name: "Clients",
      href: "/dashboard/client",
      icon: UserGroupIcon,
      roles: ["admin", "gerant"],
      subLinks: [],
    },
    {
      name: "Ventes",
      href: "/dashboard/vente",
      icon: BanknotesIcon,
      roles: ["admin", "gerant"],
      subLinks: [
        { name: "Effectuer une vente", href: "/dashboard/vente/vendre" },
        { name: "Historique des ventes", href: "/dashboard/vente/historique-vente" },
      ],
    },
    {
      name: "Commandes",
      href: "/dashboard/commande",
      icon: FileText,
      roles: ["admin", "comptable"],
      subLinks: [
        { name: "Nouvelle commande", href: "/dashboard/commande/ajouter" },
        { name: "Liste", href: "/dashboard/commande/liste" },
      ],
    },
    {
      name: "Fournisseurs",
      href: "/dashboard/fournisseurs",
      icon: Truck,
      roles: ["admin", "comptable"],
      subLinks: [
        { name: "Ajouter", href: "/dashboard/fournisseurs/ajouter" },
        { name: "Liste", href: "/dashboard/fournisseurs/liste" },
      ],
    },
    {
      name: "Utilisateurs",
      href: "/dashboard/utilisateur",
      icon: UserGroupIcon,
      roles: ["admin"],
      subLinks: [
        { name: "Créer", href: "/dashboard/utilisateur/creer" },
        { name: "Tous", href: "/dashboard/utilisateur/liste" },
      ],
    },
    {
      name: "Réglages",
      href: "/dashboard/réglages",
      icon: Cog6ToothIcon,
      roles: ["admin"],
      subLinks: [],
    }
]