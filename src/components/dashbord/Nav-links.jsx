"use client"

import { getLinks } from "@/utils/dashboardLinks"
import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useMemo, useRef } from "react"
import {
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  UserGroupIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline"
import { BarChart3, FileText, LayoutDashboard, Truck } from "lucide-react"

const ICON_MAP = {
  "Dashboard": AdjustmentsHorizontalIcon,
  "Catégories": LayoutDashboard,
  "Articles": ListBulletIcon,
  "Ventes": BanknotesIcon,
  "Devis": FileText,
  "Clients": UserGroupIcon,
  "Commandes": FileText,
  "Fournisseurs": Truck,
  "Rapports": BarChart3,
}

const NavLinks = ({ session, shopId, collapsed }) => {
  const pathName = usePathname()
  const role = session?.user?.role
  
  const [openDropdown, setOpenDropdown] = useState(null)
  const [clickedItem, setClickedItem] = useState(null)
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 })
  const [linksWithOverrides, setLinksWithOverrides] = useState(null)
  const [loading, setLoading] = useState(true)
  const itemRefs = useRef({})
  const popoverRef = useRef(null)
  const popoverTimeout = useRef(null)

  const hardcodedLinks = useMemo(() => getLinks(shopId, role), [shopId, role])

  const toggleDropdown = (name) => {
    if (collapsed) return;
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const handleClick = (link) => {
    if (!collapsed || link.subLinks.length === 0) return
    
    const element = itemRefs.current[link.name]
    if (element) {
      const rect = element.getBoundingClientRect()
      setPopoverPosition({
        top: rect.top,
        left: rect.right + 8
      })
    }
    
    // Si on clique sur le même item, on ferme
    if (clickedItem === link.name) {
      setShowPopover(false)
      setClickedItem(null)
      if (popoverTimeout.current) {
        clearTimeout(popoverTimeout.current)
      }
      return
    }
    
    // Sinon on ouvre avec un délai
    setClickedItem(link.name)
    setShowPopover(false)
    
    // Délai de 150ms avant l'apparition
    popoverTimeout.current = setTimeout(() => {
      setShowPopover(true)
    }, 150)
  }

  // Fermer le popover si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        const clickedOnMenuItem = Object.values(itemRefs.current).some(
          ref => ref && ref.contains(event.target)
        )
        if (!clickedOnMenuItem) {
          setShowPopover(false)
          setClickedItem(null)
          if (popoverTimeout.current) {
            clearTimeout(popoverTimeout.current)
          }
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (popoverTimeout.current) {
        clearTimeout(popoverTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    const loadOverrides = async () => {
      try {
        const res = await fetch("/api/navigation")
        const data = await res.json()
        
        if (data.success && data.data) {
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

  const displayLinks = linksWithOverrides || hardcodedLinks

  return (
    <>
      <div className="space-y-1">
        {displayLinks.map((link) => {
          const LinkIcon = link.icon
          const isActive = pathName === link.href || link.subLinks.some(sub => pathName === sub.href)
          const hasSubLinks = link.subLinks.length > 0

          return (
            <div 
              key={link.name}
              ref={(el) => itemRefs.current[link.name] = el}
            >
              {!hasSubLinks ? (
                // Lien simple - redirige directement
                <Link
                  href={link.href}
                  className={clsx(
                    "flex items-center gap-2 rounded-md p-3 text-sm font-medium transition-colors",
                    collapsed ? "justify-center" : "",
                    isActive 
                      ? "bg-sky-100 text-blue-600" 
                      : "bg-gray-50 hover:bg-sky-100 hover:text-blue-600"
                  )}
                  title={collapsed ? link.name : ""}
                >
                  {LinkIcon && <LinkIcon className="w-5 h-5 flex-shrink-0" />}
                  {!collapsed && <span>{link.name}</span>}
                  {!collapsed && loading && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </Link>
              ) : (
                <>
                  {collapsed ? (
                    // Mode collapsed - clic pour ouvrir le popover
                    <button
                      onClick={() => handleClick(link)}
                      className={clsx(
                        "flex w-full items-center justify-center gap-2 rounded-md p-3 text-sm font-medium transition-colors",
                        isActive || clickedItem === link.name
                          ? "bg-sky-100 text-blue-600" 
                          : "bg-gray-50 hover:bg-sky-100 hover:text-blue-600"
                      )}
                      title={link.name}
                    >
                      {LinkIcon && <LinkIcon className="w-5 h-5" />}
                    </button>
                  ) : (
                    // Mode étendu avec dropdown normal
                    <>
                      <button
                        onClick={() => toggleDropdown(link.name)}
                        className={clsx(
                          "flex w-full items-center justify-between gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 transition-colors",
                          { "bg-sky-100 text-blue-600": isActive }
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {LinkIcon && <LinkIcon className="w-5 h-5" />}
                          <span>{link.name}</span>
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
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Popover en position fixed - apparaît après délai */}
      {collapsed && clickedItem && showPopover && (
        <div
          ref={popoverRef}
          className="fixed z-[9999] min-w-[220px] animate-in fade-in slide-in-from-left-2 duration-200"
          style={{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 px-1">
            {/* Titre du menu */}
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
              {displayLinks.find(l => l.name === clickedItem)?.name}
            </div>
            
            {/* Sous-menus */}
            <div className="space-y-0.5">
              {displayLinks
                .find(l => l.name === clickedItem)
                ?.subLinks.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => {
                      setShowPopover(false)
                      setClickedItem(null)
                    }}
                    className={clsx(
                      "block rounded px-3 py-2 text-sm transition-colors",
                      pathName === sub.href
                        ? "bg-sky-100 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-sky-50 hover:text-blue-600"
                    )}
                  >
                    {sub.name}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NavLinks