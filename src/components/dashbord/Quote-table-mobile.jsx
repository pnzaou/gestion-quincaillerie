"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Printer, 
  CheckCircle, 
  XCircle, 
  Clock,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800", icon: FileText },
  sent: { label: "Envoyé", color: "bg-blue-100 text-blue-800", icon: Clock },
  accepted: { label: "Accepté", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejeté", color: "bg-red-100 text-red-800", icon: XCircle },
  expired: { label: "Expiré", color: "bg-orange-100 text-orange-800", icon: Clock },
  converted: { label: "Converti", color: "bg-purple-100 text-purple-800", icon: ShoppingCart },
};

const QuotesTableMobile = ({ quotes, onPreview, onConvert, canConvert, isExpired, formatDate }) => {
  return (
    <div className="md:hidden space-y-2">
      {quotes.length === 0 ? (
        <div className="rounded-md bg-white p-8 shadow-sm text-center text-gray-500">
          Aucun devis trouvé
        </div>
      ) : (
        quotes.map((quote) => {
          const statusConfig = STATUS_CONFIG[quote.status];
          const StatusIcon = statusConfig.icon;
          const expired = isExpired(quote);

          return (
            <div key={quote._id} className="rounded-md bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex-1">
                  <p className="text-base font-semibold">{quote.reference}</p>
                  <Badge className={cn("gap-1 mt-2", statusConfig.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                {quote.client ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Client: {quote.client.nomComplet}
                    </p>
                    {quote.client.tel && (
                      <p className="text-xs text-gray-500">{quote.client.tel}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Client: Non renseigné</p>
                )}
                
                <p className="text-sm text-gray-700">
                  Date: {formatDate(quote.quoteDate || quote.createdAt)}
                </p>
                
                <p className={cn("text-sm", expired ? "text-red-600 font-medium" : "text-gray-700")}>
                  Validité: {quote.validUntil ? (
                    <>
                      {formatDate(quote.validUntil)}
                      {expired && " (Expiré)"}
                    </>
                  ) : "-"}
                </p>
                
                <p className="text-base font-semibold text-gray-900">
                  Montant: {quote.total.toFixed(2)} FCFA
                </p>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPreview(quote)}
                  title="Aperçu et imprimer"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                {canConvert(quote) && (
                  <Button
                    size="sm"
                    onClick={() => onConvert(quote)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    title="Convertir en vente"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Convertir
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default QuotesTableMobile;