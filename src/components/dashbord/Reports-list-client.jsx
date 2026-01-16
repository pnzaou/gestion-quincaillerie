"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SearchLoader from "./Search-loader";
import ReportsTableMobile from "./Reports-table-mobile";
import ReportsTableDesktop from "./Reports-table-desktop";
import GenerateReportDialog from "./Generate-report-dialog";

const ReportsListClient = ({ 
  initialReports, 
  currentPage, 
  totalPages, 
  total, 
  shopId,
  isLoading = false 
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "all";
  const currentStatus = searchParams.get("status") || "all";

  const handleTypeChange = (type) => {
    const params = new URLSearchParams(searchParams);
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    params.set("page", "1");
    router.push(`/shop/${shopId}/dashboard/rapports?${params.toString()}`);
  };

  const handleStatusChange = (status) => {
    const params = new URLSearchParams(searchParams);
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1");
    router.push(`/shop/${shopId}/dashboard/rapports?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/shop/${shopId}/dashboard/rapports?${params.toString()}`);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/report/${id}`, { 
        method: "DELETE" 
      });
      
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleExport = async (id, format) => {
    try {
      const res = await fetch(`/api/report/${id}/export?format=${format}`);
      const blob = await res.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rapport_${format}_${id}.${format === "excel" ? "xlsx" : format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur export:", error);
    }
  };

  return (
    <>
      {/* Header avec bouton génération */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">
              {total} rapport{total > 1 ? "s" : ""} au total
            </p>
          </div>
        </div>
        <GenerateReportDialog shopId={shopId} />
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Type de rapport
              </label>
              <Select value={currentType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="quarterly">Trimestriel</SelectItem>
                  <SelectItem value="yearly">Annuel</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Statut
              </label>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="finalized">Finalisé</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loader */}
      {isLoading && <SearchLoader />}

      {/* Tables */}
      <div className={`mt-4 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
        {initialReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucun rapport trouvé
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Aucun rapport ne correspond aux filtres sélectionnés.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              {/* Mobile */}
              <ReportsTableMobile
                reports={initialReports}
                onDelete={handleDelete}
                onExport={handleExport}
                shopId={shopId}
              />

              {/* Desktop */}
              <ReportsTableDesktop
                reports={initialReports}
                onDelete={handleDelete}
                onExport={handleExport}
                shopId={shopId}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex w-full justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportsListClient;