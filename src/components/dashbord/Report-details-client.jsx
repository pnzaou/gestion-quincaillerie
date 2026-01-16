"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { ReportTypeBadge } from "./Report-type-badge";
import { ReportStatusBadge } from "./Report-status-badge";
import { ReportDetailsClients } from "./Report-details-clients";
import { ReportDetailsFinances } from "./Report-details-finances";
import { ReportDetailsInventory } from "./Report-details-inventory";
import { ReportDetailsOrders } from "./Report-details-orders";
import { ReportDetailsOverview } from "./Report-details-overview";
import { ReportDetailsSales } from "./Report-details-sales";

const formatDateTime = (date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatPeriod = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startStr = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(startDate);

  const endStr = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(endDate);

  return `${startStr} - ${endStr}`;
};

const ReportDetailsClient = ({ report, shopId }) => {
  const router = useRouter();

  const handleExport = async (format) => {
    try {
      const res = await fetch(`/api/report/${report._id}/export?format=${format}`);
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rapport_${format}_${report._id}.${
        format === "excel" ? "xlsx" : format
      }`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success(`Rapport exporté en ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Erreur export:", error);
      toast.error("Erreur lors de l'export");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/shop/${shopId}/dashboard/rapports`)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux rapports
        </Button>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {report.reference}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <ReportTypeBadge type={report.type} />
                      <ReportStatusBadge status={report.status} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Période: {formatPeriod(report.startDate, report.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Généré le: {formatDateTime(report.generatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>
                      Par: {report.generatedBy?.prenom} {report.generatedBy?.nom}
                    </span>
                  </div>
                </div>

                {report.notes && (
                  <p className="text-sm text-gray-600 italic border-l-2 border-primary pl-3">
                    {report.notes}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Exporter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport("pdf")}>
                      Exporter en PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("excel")}>
                      Exporter en Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      Exporter en CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="inventory">Stock</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ReportDetailsOverview report={report} />
        </TabsContent>

        <TabsContent value="sales">
          <ReportDetailsSales report={report} />
        </TabsContent>

        <TabsContent value="inventory">
          <ReportDetailsInventory report={report} />
        </TabsContent>

        <TabsContent value="clients">
          <ReportDetailsClients report={report} />
        </TabsContent>

        <TabsContent value="orders">
          <ReportDetailsOrders report={report} />
        </TabsContent>

        <TabsContent value="finances">
          <ReportDetailsFinances report={report} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ReportDetailsClient;