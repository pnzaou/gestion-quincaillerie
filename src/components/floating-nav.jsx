"use client";

import { NavLink } from "@/components/nav-link";
import { Users, Store, History, Menu, X, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useCallback, useEffect } from "react";

const STORAGE_KEY = "floatingnav-position";

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

const getInitialPosition = () => {
  if (typeof window === 'undefined') return { x: 24, y: 24 };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { x: 24, y: 24 };
};

const FloatingNav = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [position, setPosition] = useState(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const hasMoved = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const filteredItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleDragStart = useCallback((clientX, clientY) => {
    setIsDragging(true);
    hasMoved.current = false;
    dragStartPos.current = { x: clientX, y: clientY };
    initialPos.current = { ...position };
  }, [position]);

  const handleDragMove = useCallback((clientX, clientY) => {
    if (!isDragging) return;
    
    const deltaX = dragStartPos.current.x - clientX;
    const deltaY = dragStartPos.current.y - clientY;
    
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasMoved.current = true;
    }
    
    const newX = Math.max(16, Math.min(window.innerWidth - 80, initialPos.current.x + deltaX));
    const newY = Math.max(16, Math.min(window.innerHeight - 80, initialPos.current.y + deltaY));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
    setIsDragging(false);
  }, [isDragging, position]);

  const handleToggleClick = useCallback(() => {
    if (!hasMoved.current) {
      setIsOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => handleDragMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches[0]) handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleEnd = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (userRole !== "admin" && userRole !== "comptable") {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed flex flex-col gap-3 z-50",
        isDragging && "cursor-grabbing select-none"
      )}
      style={{ bottom: `${position.y}px`, right: `${position.x}px` }}
    >
      <div
        className={cn(
          "flex flex-col gap-3 transition-all duration-300 ease-out",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
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

            <span
              className={cn(
                "absolute right-full mr-3 px-3 py-1.5 rounded-md",
                "bg-popover text-popover-foreground text-sm font-medium",
                "shadow-md border border-border",
                "opacity-0 translate-x-2 pointer-events-none",
                "transition-all duration-200",
                "group-hover:opacity-100 group-hover:translate-x-0",
                "whitespace-nowrap"
              )}
            >
              {item.label}
            </span>
          </NavLink>
        ))}

        {/* Logout button */}
        <button
          onClick={() =>
            signOut({
              callbackUrl: "/",
              redirect: true,
            })
          }
          className={cn(
            "group relative flex items-center justify-center",
            "w-12 h-12 rounded-full",
            "bg-destructive/10 text-destructive",
            "shadow-lg border border-destructive/20",
            "transition-all duration-300 ease-out",
            "hover:scale-110 hover:shadow-xl hover:bg-destructive hover:text-white",
            "active:scale-95",
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          )}
          style={{
            transitionDelay: isOpen ? `${filteredItems.length * 50}ms` : "0ms",
          }}
        >
          <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />

          <span
            className={cn(
              "absolute right-full mr-3 px-3 py-1.5 rounded-md",
              "bg-popover text-popover-foreground text-sm font-medium",
              "shadow-md border border-border",
              "opacity-0 translate-x-2 pointer-events-none",
              "transition-all duration-200",
              "group-hover:opacity-100 group-hover:translate-x-0",
              "whitespace-nowrap"
            )}
          >
            Déconnexion
          </span>
        </button>
      </div>

      {/* Toggle button - also serves as drag handle */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          handleDragStart(e.clientX, e.clientY);
        }}
        onMouseUp={handleToggleClick}
        onTouchStart={(e) => {
          if (e.touches[0]) handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handleToggleClick}
        className={cn(
          "flex items-center justify-center",
          "w-14 h-14 rounded-full",
          "bg-blue-600 text-primary-foreground",
          "shadow-xl border border-primary/20",
          "transition-all duration-300 ease-out",
          "hover:scale-110 hover:shadow-2xl",
          isDragging ? "cursor-grabbing scale-105" : "cursor-grab"
        )}
      >
        <div className="relative w-6 h-6">
          <Menu
            className={cn(
              "absolute inset-0 h-6 w-6 transition-all duration-300",
              isOpen
                ? "opacity-0 rotate-90 scale-0"
                : "opacity-100 rotate-0 scale-100"
            )}
          />
          <X
            className={cn(
              "absolute inset-0 h-6 w-6 transition-all duration-300",
              isOpen
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-0"
            )}
          />
        </div>
      </button>
    </div>
  );
};

export default FloatingNav;