"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History as HistoryIcon,
  Eye,
  Plus,
  ArrowRightLeft,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  Download,
  Store,
  User,
  Package,
  CalendarIcon,
  Globe,
  Loader2,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const actionConfig = {
  read: {
    icon: Eye,
    label: "Lecture",
    color: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
  create: {
    icon: Plus,
    label: "Création",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  convert: {
    icon: ArrowRightLeft,
    label: "Conversion",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  update: {
    icon: Pencil,
    label: "Modification",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  delete: {
    icon: Trash2,
    label: "Suppression",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  login: {
    icon: LogIn,
    label: "Connexion",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
  logout: {
    icon: LogOut,
    label: "Déconnexion",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  download: {
    icon: Download,
    label: "Téléchargement",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  },
};

const resourceIcons = {
  product: Package,
  user: User,
  business: Store,
  category: Package,
  supplier: Store,
  client: User,
  sale: Package,
  order: Package,
  quote: FileText
};

const resourceMap = {
  sale: "vente",
  order: "commande",
  product: "produit",
  user: "utilisateur",
  business: "boutique",
  category: "catégorie",
  supplier: "fournisseur",
  "client-account": "compte client",
  quote: "devis"
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [histories, setHistories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [selectedBusiness, setSelectedBusiness] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const scrollAreaRef = useRef(null);
  const observerTarget = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Charger les boutiques au montage
  useEffect(() => {
    if (status !== "authenticated") return;

    let aborted = false;
    const controller = new AbortController();

    const loadBusinesses = async () => {
      try {
        const response = await fetch("/api/business", { signal: controller.signal });
        const data = await response.json();
        if (!aborted && response.ok) {
          setBusinesses(data.businesses || []);
        } else if (!aborted && !response.ok) {
          console.error("Erreur chargement boutiques:", data);
        }
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Erreur chargement boutiques:", error);
      }
    };
    loadBusinesses();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, []);

  // Fonction pour charger l'historique
  const loadHistory = async (page = 1, append = false) => {
    if (status !== "authenticated") return;
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "50");

      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }
      if (endDate) {
        params.append("endDate", endDate.toISOString());
      }
      if (selectedBusiness !== "all") {
        params.append("businessId", selectedBusiness);
      }

      const response = await fetch(`/api/history?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        const newHistories = data.data || [];
        
        if (append) {
          // Ajouter les nouvelles données à la suite
          setHistories(prev => [...prev, ...newHistories]);
        } else {
          // Remplacer toutes les données
          setHistories(newHistories);
        }

        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setHasMore(data.currentPage < data.totalPages);
      } else {
        toast.error(data.message || "Erreur lors du chargement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Charger la première page quand les filtres changent
  useEffect(() => {
    if (status !== "authenticated") return;
    setCurrentPage(1);
    setHasMore(true);
    loadHistory(1, false);
  }, [startDate, endDate, selectedBusiness, status]);

  // Intersection Observer pour le scroll infini
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Si l'élément est visible et qu'on peut charger plus
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          const nextPage = currentPage + 1;
          loadHistory(nextPage, true);
        }
      },
      {
        root: null,
        rootMargin: "100px", // Déclencher 100px avant la fin
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, currentPage]);

  if (status === "loading") {
    return (
      <div className="container max-w-5xl mx-auto py-6">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground/50" />
          <p className="mt-4">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedBusiness("all");
  };

  return (
    <div className="container max-w-5xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-[#1166D4]/10">
            <HistoryIcon className="h-8 w-8 text-[#1166D4]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
            <p className="text-muted-foreground">
              Suivez toutes les activités et modifications
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Business Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Boutique
              </label>
              <Select
                value={selectedBusiness}
                onValueChange={setSelectedBusiness}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Toutes les boutiques
                    </div>
                  </SelectItem>
                  <SelectItem value="global">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Actions globales
                    </div>
                  </SelectItem>
                  {businesses.map((business) => (
                    <SelectItem key={business._id} value={business._id}>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        {business.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Date de début
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate
                      ? format(startDate, "PPP", { locale: fr })
                      : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Date de fin
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate
                      ? format(endDate, "PPP", { locale: fr })
                      : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {(startDate || endDate || selectedBusiness !== "all") && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="whitespace-nowrap"
                >
                  Réinitialiser
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>
              Activité récente{" "}
              {isLoading && (
                <span className="text-muted-foreground font-normal">
                  (Chargement...)
                </span>
              )}
            </span>
            {!isLoading && histories.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                Page {currentPage} / {totalPages}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-28rem)]" ref={scrollAreaRef}>
            <div className="px-6 pb-6">
              {histories.length === 0 && !isLoading ? (
                <div className="py-12 text-center">
                  <HistoryIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    Aucune activité
                  </h3>
                  <p className="text-muted-foreground">
                    Aucune activité trouvée pour cette période
                  </p>
                </div>
              ) : (
                <div className="relative pt-2">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

                  {/* Timeline items */}
                  <div className="space-y-6">
                    {histories.map((item, index) => {
                      const config = actionConfig[item.actions];
                      const ActionIcon = config?.icon || Eye;
                      const ResourceIcon = item.resource
                        ? resourceIcons[item.resource.toLowerCase()] || Package
                        : ActionIcon;

                      return (
                        <div
                          key={`${item.id}-${index}`}
                          className="relative flex gap-4 pl-14"
                        >
                          {/* Icon */}
                          <div
                            className={cn(
                              "absolute left-0 p-2.5 rounded-full border-2 border-background bg-secondary shadow-sm"
                            )}
                          >
                            <ResourceIcon className="h-4 w-4 text-secondary-foreground" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className={cn("text-xs", config?.color)}
                              >
                                <ActionIcon className="h-3 w-3 mr-1" />
                                {config?.label || item.actions}
                              </Badge>
                              {item.resource && (
                                <Badge variant="secondary" className="text-xs">
                                  {resourceMap[item.resource]}
                                </Badge>
                              )}
                              {item.business && (
                                <Badge variant="outline" className="text-xs">
                                  <Store className="h-3 w-3 mr-1" />
                                  {item.business.name}
                                </Badge>
                              )}
                            </div>

                            {item.description && (
                              <p className="text-sm text-foreground mb-1">
                                {item.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {item.user && (
                                <>
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {item.user.name}
                                  </span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{formatDate(item.createdAt)}</span>
                              {item.resourceId && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-muted-foreground/70">
                                    {item.resourceId}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Observer target pour le scroll infini */}
                  <div
                    ref={observerTarget}
                    className="h-20 flex items-center justify-center"
                  >
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Chargement...</span>
                      </div>
                    )}
                    {!hasMore && histories.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Fin de l'historique
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Loading initial */}
              {isLoading && histories.length === 0 && (
                <div className="py-12 text-center">
                  <Loader2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4 animate-spin" />
                  <h3 className="font-semibold text-lg mb-2">Chargement...</h3>
                  <p className="text-muted-foreground">
                    Récupération de l'historique en cours...
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;