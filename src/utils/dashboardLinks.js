import {
    AdjustmentsHorizontalIcon,
    ListBulletIcon,
    UserGroupIcon
  } from "@heroicons/react/24/outline"

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
      icon: "",
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
        { name: "Stock", href: "/dashboard/article/stock" },
        { name: "Commander", href: "/dashboard/article/commander" },
      ],
    },
    {
      name: "Clients",
      href: "/dashboard/client",
      icon: UserGroupIcon,
      roles: ["admin", "gerant", "comptable"],
      subLinks: [],
    },
    {
      name: "Ventes",
      href: "/dashboard/vente",
      icon: "",
      roles: ["admin", "gerant"],
      subLinks: [],
    },
    {
      name: "Fournisseurs",
      href: "/dashboard/fournisseurs",
      icon: "",
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
]