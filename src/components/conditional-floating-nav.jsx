"use client";

import { usePathname } from "next/navigation";
import FloatingNav from "@/components/floating-nav";

const ConditionalFloatingNav = () => {
  const pathname = usePathname();
  
  // Afficher seulement sur /shop ou /utilisateur/liste (et leurs sous-routes)
  const shouldShow = pathname.startsWith("/shop") || pathname.startsWith("/utilisateur/liste") || pathname.startsWith("/utilisateur/creer") || pathname.startsWith("/historique");
  
  if (!shouldShow) return null;
  
  return <FloatingNav />;
};

export default ConditionalFloatingNav;