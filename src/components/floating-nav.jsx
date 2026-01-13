"use client";

import { NavLink } from "@/components/nav-link";
import { Users, Store, History, Menu, X, Settings, LogOut, Bell, Check, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

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

// Composant Notification Item (version compacte pour liste)
const NotificationItem = ({ notification, onMarkAsRead, onDelete, onClick }) => {
  const priorityColors = {
    urgent: "bg-red-50 border-red-200",
    high: "bg-orange-50 border-orange-200",
    medium: "bg-blue-50 border-blue-200",
    low: "bg-gray-50 border-gray-200",
  };

  const typeIcons = {
    stock_out: "🚨",
    low_stock: "⚠️",
    order_received: "📦",
    payment_received: "💰",
    system: "ℹ️",
  };

  return (
    <div
      onClick={() => onClick(notification)}
      className={cn(
        "p-3 border rounded-lg transition-all cursor-pointer",
        notification.isRead ? "bg-white border-gray-200" : priorityColors[notification.priority],
        "hover:shadow-md hover:scale-[1.02]"
      )}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0">{typeIcons[notification.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
              {notification.title}
            </h4>
            {!notification.isRead && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                Nouveau
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.createdAt), { 
                addSuffix: true, 
                locale: fr 
              })}
            </span>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {!notification.isRead && (
                <button
                  onClick={() => onMarkAsRead(notification._id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Marquer comme lu"
                >
                  <Check className="h-3 w-3 text-green-600" />
                </button>
              )}
              <button
                onClick={() => onDelete(notification._id)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Supprimer"
              >
                <Trash2 className="h-3 w-3 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dialog détail notification
const NotificationDialog = ({ notification, open, onClose, onMarkAsRead, onDelete }) => {
  if (!notification) return null;

  const priorityColors = {
    urgent: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300" },
    high: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300" },
    medium: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
    low: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-300" },
  };

  const typeIcons = {
    stock_out: "🚨",
    low_stock: "⚠️",
    order_received: "📦",
    payment_received: "💰",
    system: "ℹ️",
  };

  const typeLabels = {
    stock_out: "Rupture de stock",
    low_stock: "Alerte stock",
    order_received: "Commande reçue",
    payment_received: "Paiement reçu",
    system: "Système",
  };

  const colors = priorityColors[notification.priority];

  const handleClose = async () => {
    // Marquer comme lu avant fermeture si pas déjà lu
    if (!notification.isRead) {
      await onMarkAsRead(notification._id);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{typeIcons[notification.type]}</span>
            <div className="flex-1">
              <DialogTitle className="text-xl">{notification.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn(colors.bg, colors.text, colors.border, "border")}>
                  {typeLabels[notification.type]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {notification.priority === "urgent" ? "🔴 Urgent" : 
                   notification.priority === "high" ? "🟠 Important" :
                   notification.priority === "medium" ? "🔵 Moyen" : "⚪ Faible"}
                </Badge>
                {!notification.isRead && (
                  <Badge variant="secondary">Nouveau</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Message</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {notification.message}
            </p>
          </div>

          {/* Metadata */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Détails</h4>
              <div className={cn("p-3 rounded-lg border", colors.bg, colors.border)}>
                <dl className="space-y-2">
                  {notification.metadata.productName && (
                    <div className="flex justify-between text-sm">
                      <dt className="font-medium text-gray-700">Produit :</dt>
                      <dd className="text-gray-900">{notification.metadata.productName}</dd>
                    </div>
                  )}
                  {notification.metadata.currentStock !== undefined && (
                    <div className="flex justify-between text-sm">
                      <dt className="font-medium text-gray-700">Stock actuel :</dt>
                      <dd className={cn("font-semibold", colors.text)}>
                        {notification.metadata.currentStock} unités
                      </dd>
                    </div>
                  )}
                  {notification.metadata.alertThreshold !== undefined && (
                    <div className="flex justify-between text-sm">
                      <dt className="font-medium text-gray-700">Seuil d'alerte :</dt>
                      <dd className="text-gray-900">{notification.metadata.alertThreshold} unités</dd>
                    </div>
                  )}
                  {notification.metadata.saleReference && (
                    <div className="flex justify-between text-sm">
                      <dt className="font-medium text-gray-700">Référence vente :</dt>
                      <dd className="text-gray-900 font-mono">{notification.metadata.saleReference}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {/* Lien ressource */}
          {notification.relatedResource?.resourceType === "product" && (
            <div>
              <Link
                href={`/shop/${notification.business}/dashboard/article/stock`}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Voir le stock
              </Link>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.createdAt), { 
                addSuffix: true, 
                locale: fr 
              })}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onDelete(notification._id);
                  onClose();
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
              <Button
                size="sm"
                onClick={handleClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FloatingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasSeenNotifications, setHasSeenNotifications] = useState(false); // ✅ Nouveau
  const hasMoved = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const filteredItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  // Charger notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications?limit=20");
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Erreur chargement notifications:", error);
      }
    };

    if (session?.user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erreur marquer comme lu:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const notification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setUnreadCount(prev => {
          return notification?.isRead ? prev : Math.max(0, prev - 1);
        });
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    setNotificationsOpen(false); // Fermer le popover
  };

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
      setIsOpen(prev => {
        const newIsOpen = !prev;
        // ✅ Quand on ouvre, marquer notifications comme "vues"
        if (newIsOpen && unreadCount > 0) {
          setHasSeenNotifications(true);
        }
        return newIsOpen;
      });
    }
  }, [unreadCount]);

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

  // ✅ Reset "hasSeenNotifications" quand on ferme le menu
  useEffect(() => {
    if (!isOpen) {
      setHasSeenNotifications(false);
    }
  }, [isOpen]);

  if (userRole !== "admin" && userRole !== "comptable" && userRole !== "gerant") {
    return null;
  }

  // ✅ Afficher badge sur toggle button seulement si pas ouvert et pas vu
  const showBadgeOnToggle = unreadCount > 0 && !isOpen && !hasSeenNotifications;

  return (
    <>
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

          {/* Notifications Popover */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "group relative flex items-center justify-center",
                  "w-14 h-14 rounded-full",
                  "bg-secondary text-secondary-foreground",
                  "shadow-lg border border-border",
                  "transition-all duration-300 ease-out",
                  "hover:scale-110 hover:shadow-xl hover:bg-blue-600 hover:text-primary-foreground",
                  "active:scale-95"
                )}
              >
                <Bell className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 animate-pulse"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
                <span className={cn(
                  "absolute right-full mr-3 px-3 py-1.5 rounded-md",
                  "bg-popover text-popover-foreground text-sm font-medium",
                  "shadow-md border border-border",
                  "opacity-0 translate-x-2 pointer-events-none",
                  "transition-all duration-200",
                  "group-hover:opacity-100 group-hover:translate-x-0",
                  "whitespace-nowrap"
                )}>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0" 
              side="left" 
              align="start"
              sideOffset={10}
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
                  </p>
                )}
              </div>
              <ScrollArea className="h-96">
                <div className="p-2 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onClick={handleNotificationClick}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Logout button */}
          <button
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            className={cn(
              "group relative flex items-center justify-center",
              "w-12 h-12 rounded-full",
              "bg-destructive/10 text-destructive",
              "shadow-lg border border-destructive/20",
              "transition-all duration-300 ease-out",
              "hover:scale-110 hover:shadow-xl hover:bg-destructive hover:text-white",
              "active:scale-95"
            )}
            style={{ transitionDelay: isOpen ? `${filteredItems.length + 1 * 50}ms` : "0ms" }}
          >
            <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
            <span className={cn(
              "absolute right-full mr-3 px-3 py-1.5 rounded-md",
              "bg-popover text-popover-foreground text-sm font-medium",
              "shadow-md border border-border",
              "opacity-0 translate-x-2 pointer-events-none",
              "transition-all duration-200",
              "group-hover:opacity-100 group-hover:translate-x-0",
              "whitespace-nowrap"
            )}>
              Déconnexion
            </span>
          </button>
        </div>

        {/* Toggle button avec badge conditionnel */}
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
            "relative flex items-center justify-center",
            "w-14 h-14 rounded-full",
            "bg-blue-600 text-primary-foreground",
            "shadow-xl border border-primary/20",
            "transition-all duration-300 ease-out",
            "hover:scale-110 hover:shadow-2xl",
            isDragging ? "cursor-grabbing scale-105" : "cursor-grab"
          )}
        >
          {/* ✅ Badge sur toggle button */}
          {showBadgeOnToggle && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          
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

      {/* Dialog détail notification */}
      <NotificationDialog
        notification={selectedNotification}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedNotification(null);
        }}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    </>
  );
};

export default FloatingNav;