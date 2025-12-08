"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

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

const HistoryPage = () => {
  const [histories, setHistories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [selectedBusiness, setSelectedBusiness] = useState("all");

  // Charger les boutiques au montage
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const response = await fetch("/api/business");
        const data = await response.json();
        if (response.ok) {
          setBusinesses(data.businesses || []);
        }
      } catch (error) {
        console.error("Erreur chargement boutiques:", error);
      }
    };
    loadBusinesses();
  }, []);

  // Fonction pour charger l'historique
  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
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
        setHistories(data.data || []);
      } else {
        toast.error(data.message || "Erreur lors du chargement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger l'historique au montage et quand les filtres changent
  useEffect(() => {
    loadHistory();
  }, [startDate, endDate, selectedBusiness]);

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
          <div className="p-3 rounded-xl bg-primary/10">
            <HistoryIcon className="h-8 w-8 text-primary" />
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
          <CardTitle className="text-lg">
            Activité récente{" "}
            {isLoading && (
              <span className="text-muted-foreground font-normal">
                (Chargement...)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-28rem)]">
            <div className="px-6 pb-6">
              {histories.length === 0 ? (
                <div className="py-12 text-center">
                  <HistoryIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {isLoading ? "Chargement..." : "Aucune activité"}
                  </h3>
                  <p className="text-muted-foreground">
                    {isLoading
                      ? "Récupération de l'historique en cours..."
                      : "Aucune activité trouvée pour cette période"}
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
                          key={item.id}
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
                                  {item.resource}
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
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
