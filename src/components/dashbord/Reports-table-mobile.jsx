"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Download, Trash2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import { ReportTypeBadge } from "./Report-type-badge";
import { ReportStatusBadge } from "./Report-status-badge";

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

const ReportsTableMobile = ({ reports, onDelete, onExport, shopId }) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const handleDelete = async () => {
    if (reportToDelete) {
      try {
        await onDelete(reportToDelete);
        toast.success("Rapport supprimé avec succès");
      } catch (error) {
        toast.error("Impossible de supprimer le rapport");
      }
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  const handleExport = async (id, format) => {
    try {
      await onExport(id, format);
      toast.success(`Rapport exporté en ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  return (
    <>
      <div className="md:hidden space-y-2">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Aucun rapport trouvé
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report._id} className="rounded-md bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex-1">
                    <p className="text-base font-semibold">{report.reference}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <ReportTypeBadge type={report.type} />
                      <ReportStatusBadge status={report.status} />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Période:</span>
                    <p className="font-medium">
                      {formatPeriod(report.startDate, report.endDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Généré le:</span>
                    <p className="font-medium">{formatDateTime(report.generatedAt)}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Par: {report.generatedBy?.prenom} {report.generatedBy?.nom}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/shop/${shopId}/dashboard/rapports/${report._id}`)
                    }
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Voir
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleExport(report._id, "pdf")}
                      >
                        PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport(report._id, "excel")}
                      >
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport(report._id, "csv")}
                      >
                        CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setReportToDelete(report._id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReportsTableMobile;