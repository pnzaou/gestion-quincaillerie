"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Printer, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronLeft,
  ChevronRight,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConvertQuoteDialog } from "./Convert-quote-dialog";
import { QuotePreview, QuotePrint } from "./Quote-Preview";

const STATUS_CONFIG = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800", icon: FileText },
  sent: { label: "Envoyé", color: "bg-blue-100 text-blue-800", icon: Clock },
  accepted: { label: "Accepté", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejeté", color: "bg-red-100 text-red-800", icon: XCircle },
  expired: { label: "Expiré", color: "bg-orange-100 text-orange-800", icon: Clock },
  converted: { label: "Converti", color: "bg-purple-100 text-purple-800", icon: ShoppingCart },
};

const QuotesListClient = ({ initialQuotes, currentPage, totalPages, total, shopId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const currentStatus = searchParams.get("status") || "";

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const isExpired = (quote) => {
    if (!quote.validUntil) return false;
    return new Date(quote.validUntil) < new Date();
  };

  const canConvert = (quote) => {
    return (
      quote.status === "sent" || 
      quote.status === "accepted"
    ) && !isExpired(quote);
  };

  const handleStatusChange = (status) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`/shop/${shopId}/dashboard/devis?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/shop/${shopId}/dashboard/devis?${params.toString()}`);
  };

  const handleConvert = (quote) => {
    setSelectedQuote(quote);
    setConvertDialogOpen(true);
  };

  const handlePreview = (quote) => {
    setSelectedQuote(quote);
    setPreviewDialogOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConversionSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <div className="space-y-4">
        {/* Filtres et stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Statut:</span>
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="sent">Envoyé</SelectItem>
                <SelectItem value="accepted">Accepté</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="converted">Converti</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {total} devis au total
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Validité</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun devis trouvé
                  </TableCell>
                </TableRow>
              ) : (
                initialQuotes.map((quote) => {
                  const statusConfig = STATUS_CONFIG[quote.status];
                  const StatusIcon = statusConfig.icon;
                  const expired = isExpired(quote);

                  return (
                    <TableRow key={quote._id}>
                      <TableCell className="font-medium">
                        {quote.reference}
                      </TableCell>
                      <TableCell>
                        {quote.client ? (
                          <div>
                            <div className="font-medium">{quote.client.nomComplet}</div>
                            {quote.client.tel && (
                              <div className="text-xs text-muted-foreground">
                                {quote.client.tel}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non renseigné</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(quote.quoteDate || quote.createdAt)}</TableCell>
                      <TableCell>
                        {quote.validUntil ? (
                          <span className={expired ? "text-red-600 font-medium" : ""}>
                            {formatDate(quote.validUntil)}
                            {expired && " (Expiré)"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {quote.total.toFixed(2)} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", statusConfig.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(quote)}
                            title="Aperçu"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          {canConvert(quote) && (
                            <Button
                              size="sm"
                              onClick={() => handleConvert(quote)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              title="Convertir en vente"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Convertir
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
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
      </div>

      {/* Dialogs */}
      <ConvertQuoteDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        quote={selectedQuote}
        onSuccess={handleConversionSuccess}
      />

      <QuotePreview
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        quote={selectedQuote}
        onPrint={handlePrint}
      />

      <QuotePrint quote={selectedQuote} />
    </>
  );
};

export default QuotesListClient;