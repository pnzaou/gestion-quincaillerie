"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Download, Trash2 } from "lucide-react";
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

const ReportsTableDesktop = ({ reports, onDelete, onExport, shopId }) => {
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
      <table className="hidden min-w-full text-gray-900 md:table">
        <thead className="text-left text-sm font-normal">
          <tr>
            <th className="px-3 py-5 font-medium">Référence</th>
            <th className="px-3 py-5 font-medium">Type</th>
            <th className="px-3 py-5 font-medium">Période</th>
            <th className="px-3 py-5 font-medium">Généré le</th>
            <th className="px-3 py-5 font-medium">Par</th>
            <th className="px-3 py-5 font-medium">Statut</th>
            <th className="py-5 pl-6 pr-3 text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {reports.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                Aucun rapport trouvé
              </td>
            </tr>
          ) : (
            reports.map((report) => (
              <tr key={report._id} className="border-b last:border-none text-sm">
                <td className="whitespace-nowrap px-3 py-4 font-medium">
                  {report.reference}
                </td>
                <td className="px-3 py-4">
                  <ReportTypeBadge type={report.type} />
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  {formatPeriod(report.startDate, report.endDate)}
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  {formatDateTime(report.generatedAt)}
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  {report.generatedBy?.prenom} {report.generatedBy?.nom}
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <ReportStatusBadge status={report.status} />
                </td>
                <td className="whitespace-nowrap py-4 pl-6 pr-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/shop/${shopId}/dashboard/rapports/${report._id}`)
                      }
                      title="Voir le rapport"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" title="Exporter">
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleExport(report._id, "pdf")}
                        >
                          Exporter PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExport(report._id, "excel")}
                        >
                          Exporter Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExport(report._id, "csv")}
                        >
                          Exporter CSV
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setReportToDelete(report._id);
                        setDeleteDialogOpen(true);
                      }}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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

export default ReportsTableDesktop;