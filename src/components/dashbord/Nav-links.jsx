"use client"

import { getLinks } from "@/utils/dashboardLinks"
import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const NavLinks = ({ session, shopId }) => {
  const pathName = usePathname()
  const role = session?.user?.role
  const [openDropdown, setOpenDropdown] = useState(null)

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const links = getLinks(shopId)
  const filteredLinks = links.filter(link => link.roles.includes(role))

  return (
    <div className="space-y-1">
      {filteredLinks.map((link) => {
        const LinkIcon = link.icon
        const isActive = pathName === link.href || link.subLinks.some(sub => pathName === sub.href)

        return (
          <div key={link.name} className="relative">
            {link.subLinks.length === 0 ? (
              <Link
                href={link.href}
                className={clsx(
                  "flex w-full items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:px-3",
                  { "bg-sky-100 text-blue-600": isActive }
                )}
              >
                {LinkIcon && <LinkIcon className="w-5 h-5" />}
                <span>{link.name}</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleDropdown(link.name)}
                  className={clsx(
                    "flex w-full items-center justify-between gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:px-3",
                    { "bg-sky-100 text-blue-600": isActive }
                  )}
                >
                  <div className="flex items-center gap-2">
                    {LinkIcon && <LinkIcon className="w-5 h-5" />}
                    <span>{link.name}</span>
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
                          "block rounded px-3 py-1 text-sm text-gray-700 hover:bg-sky-100",
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
