"use client";

import { NavLink } from "@/components/nav-link";
import { Users, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const navItems = [
  {
    href: "/shop",
    icon: Store,
    label: "Boutiques",
    roles: ["admin", "comptable"],
  },
  {
    href: "/utilisateur/liste",
    icon: Users,
    label: "Utilisateurs",
    roles: ["admin"],
  },
];

const FloatingNav = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const filteredItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {filteredItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          className={cn(
            "group relative flex items-center justify-center",
            "w-14 h-14 rounded-full",
            "bg-secondary text-secondary-foreground",
            "shadow-lg border border-border",
            "transition-all duration-300 ease-out",
            "hover:scale-110 hover:shadow-xl hover:bg-blue-600 hover:text-primary-foreground",
            "active:scale-95"
          )}
          activeClassName="bg-blue-600 text-primary-foreground shadow-xl ring-2 ring-primary/30"
        >
          <item.icon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
          
          {/* Tooltip */}
          <span className={cn(
            "absolute right-full mr-3 px-3 py-1.5 rounded-md",
            "bg-popover text-popover-foreground text-sm font-medium",
            "shadow-md border border-border",
            "opacity-0 translate-x-2 pointer-events-none",
            "transition-all duration-200",
            "group-hover:opacity-100 group-hover:translate-x-0",
            "whitespace-nowrap"
          )}>
            {item.label}
          </span>
        </NavLink>
      ))}
    </div>
  );
};

export default FloatingNav;