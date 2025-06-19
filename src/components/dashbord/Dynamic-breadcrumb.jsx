"use client"

import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import Link from "next/link";

const DynamicBreadcrumb = () => {
    const pathname = usePathname()

    if(!pathname || pathname === "/dashboard") {
        return null;
    }

    const segments = pathname
        .split("/")
        .filter(Boolean)
        .filter((segment) => !isId(segment))

        const formatSegment = (segment) => 
            segment
               .replace(/-/g, " ")
               .replace(/\b\w/g, (l) => l.toUpperCase())

        function isId(str) {
            return (
                /^[0-9a-fA-F]{24}$/.test(str) ||
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
            )
        }

    return (
      <div className="mb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Tableau de bord</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {segments.slice(1).map((segment, index) => {
              const href =
                "/dashboard/" + segments.slice(1, index + 2).join("/");

              const isLat = index === segments.slice(1).length - 1;

              return (
                <span key={href} className="flex items-center">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLat ? (
                      <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{formatSegment(segment)}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
}

export default DynamicBreadcrumb;
