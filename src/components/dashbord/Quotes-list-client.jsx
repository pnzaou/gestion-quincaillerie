"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import QuotesTableMobile from "./Quote-table-mobile";
import QuotesTableDesktop from "./Quote-table-desktop";
import { ConvertQuoteDialog } from "./Convert-quote-dialog";
import { QuotePreview, QuotePrint } from "./Quote-Preview";

const QuotesListClient = ({ 
  initialQuotes, 
  currentPage, 
  totalPages, 
  total, 
  shopId,
  isLoading = false 
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const currentStatus = searchParams.get("status") || "all";

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
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
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
      {/* Filtres */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-gray-600 whitespace-nowrap">Statut:</span>
          <Select value={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
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

        <div className="text-sm text-gray-600">
          {total} devis au total
        </div>
      </div>

      {/* Loader */}
      {isLoading && <SearchLoader />}

      {/* Tables */}
      <div className={`mt-4 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            {/* Mobile */}
            <QuotesTableMobile
              quotes={initialQuotes}
              onPreview={handlePreview}
              onConvert={handleConvert}
              canConvert={canConvert}
              isExpired={isExpired}
              formatDate={formatDate}
            />

            {/* Desktop avec scroll isolé */}
            <QuotesTableDesktop
              quotes={initialQuotes}
              onPreview={handlePreview}
              onConvert={handleConvert}
              canConvert={canConvert}
              isExpired={isExpired}
              formatDate={formatDate}
            />
          </div>
        </div>
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
              <span className="hidden sm:inline">Précédent</span>
            </Button>
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

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