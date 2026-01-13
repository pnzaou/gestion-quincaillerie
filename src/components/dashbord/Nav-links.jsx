"use client"

import { getLinks } from "@/utils/dashboardLinks"
import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import {
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  UserGroupIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline"
import { FileText, LayoutDashboard, Truck } from "lucide-react"

// Map des icônes par nom de ressource
const ICON_MAP = {
  "Dashboard": AdjustmentsHorizontalIcon,
  "Catégories": LayoutDashboard,
  "Articles": ListBulletIcon,
  "Ventes": BanknotesIcon,
  "Devis": FileText,
  "Clients": UserGroupIcon,
  "Commandes": FileText,
  "Fournisseurs": Truck,
}

const NavLinks = ({ session, shopId }) => {
  const pathName = usePathname()
  const role = session?.user?.role
  
  const [openDropdown, setOpenDropdown] = useState(null)
  const [linksWithOverrides, setLinksWithOverrides] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ Liens hardcodés (affichés immédiatement)
  const hardcodedLinks = useMemo(() => getLinks(shopId, role), [shopId, role])

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  // ✅ Charger les liens avec overrides en arrière-plan
  useEffect(() => {
    const loadOverrides = async () => {
      try {
        const res = await fetch("/api/navigation")
        const data = await res.json()
        
        if (data.success && data.data) {
          // Mapper avec les hrefs et icônes
          const linksFromAPI = data.data.map(link => {
            const hardcodedLink = hardcodedLinks.find(h => h.name === link.name)
            
            return {
              name: link.name,
              href: hardcodedLink?.href || "#",
              icon: ICON_MAP[link.name],
              resource: link.resource,
              subLinks: link.subLinks.map(sub => {
                const hardcodedSub = hardcodedLink?.subLinks.find(h => h.name === sub.name)
                return {
                  name: sub.name,
                  href: hardcodedSub?.href || "#"
                }
              })
            }
          })
          
          setLinksWithOverrides(linksFromAPI)
        }
      } catch (error) {
        console.error("Erreur chargement overrides:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOverrides()
  }, [hardcodedLinks])

  // ✅ Utiliser les liens avec overrides si disponibles, sinon hardcodés
  const displayLinks = linksWithOverrides || hardcodedLinks

  return (
    <div className="space-y-1">
      {displayLinks.map((link) => {
        const LinkIcon = link.icon
        const isActive = pathName === link.href || link.subLinks.some(sub => pathName === sub.href)

        return (
          <div key={link.name} className="relative">
            {link.subLinks.length === 0 ? (
              <Link
                href={link.href}
                className={clsx(
                  "flex w-full items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:px-3 transition-colors",
                  { "bg-sky-100 text-blue-600": isActive }
                )}
              >
                {LinkIcon && <LinkIcon className="w-5 h-5" />}
                <span>{link.name}</span>
                {/* ✅ Indicateur de chargement overrides */}
                {loading && (
                  <div className="ml-auto">
                    <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  </div>
                )}
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleDropdown(link.name)}
                  className={clsx(
                    "flex w-full items-center justify-between gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:px-3 transition-colors",
                    { "bg-sky-100 text-blue-600": isActive }
                  )}
                >
                  <div className="flex items-center gap-2">
                    {LinkIcon && <LinkIcon className="w-5 h-5" />}
                    <span>{link.name}</span>
                    {/* ✅ Indicateur de chargement overrides */}
                    {loading && (
                      <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    )}
                  </div>
                  <svg
                    className={clsx("w-4 h-4 transition-transform", {
                      "rotate-180": openDropdown === link.name,
                    })}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openDropdown === link.name && (
                  <div className="ml-4 mt-1 space-y-1 rounded bg-white shadow-md p-2">
                    {link.subLinks.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={clsx(
                          "block rounded px-3 py-1 text-sm text-gray-700 hover:bg-sky-100 transition-colors",
                          { "bg-sky-100 text-blue-600": pathName === sub.href }
                        )}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default NavLinks