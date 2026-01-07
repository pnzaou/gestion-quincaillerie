"use client";

import { NavLink } from "@/components/nav-link";
import { Users, Store, History, Menu, X, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useState } from "react";

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
  {
    href: "/historique",
    icon: History,
    label: "Historique",
    roles: ["admin"],
  },
  {
    href: "/reglages",
    icon: Settings,
    label: "Réglages",
    roles: ["admin"],
  },
];

const FloatingNav = () => {
  const [isOpen, setIsOpen] = useState(true);

  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const filteredItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <div className={cn(
        "flex flex-col gap-3 transition-all duration-300 ease-out",
        isOpen 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-4 pointer-events-none"
      )}>
      {filteredItems.map((item, index) => (
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
          style={{ transitionDelay: isOpen ? `${index * 50}ms` : "0ms" }}
          activeClassName="bg-blue-600 text-primary-foreground shadow-xl ring-2 ring-primary/30"
        >
          <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          
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

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center",
          "w-14 h-14 rounded-full",
          "bg-blue-600 text-primary-foreground",
          "shadow-xl border border-primary/20",
          "transition-all duration-300 ease-out",
          "hover:scale-110 hover:shadow-2xl",
          "active:scale-95"
        )}
      >
        <div className="relative w-6 h-6">
          <Menu className={cn(
            "absolute inset-0 h-6 w-6 transition-all duration-300",
            isOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
          )} />
          <X className={cn(
            "absolute inset-0 h-6 w-6 transition-all duration-300",
            isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
          )} />
        </div>
      </button>
    </div>
  );
};

export default FloatingNav;