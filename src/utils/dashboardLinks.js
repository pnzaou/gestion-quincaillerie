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
      name: "Produits",
      href: "/dashboard/produit",
      icon: ListBulletIcon,
      roles: ["admin"],
      subLinks: [
        { name: "Ajouter", href: "/dashboard/produit/ajouter" },
        { name: "Stock", href: "/dashboard/produit/stock" },
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
      name: "Commandes",
      href: "/dashboard/commande",
      icon: "",
      roles: ["admin", "comptable"],
      subLinks: [],
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