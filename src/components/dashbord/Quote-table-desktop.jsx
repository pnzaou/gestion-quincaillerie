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

const QuotesTableDesktop = ({ quotes, onPreview, onConvert, canConvert, isExpired, formatDate }) => {
  return (
    <table className="hidden min-w-full text-gray-900 md:table">
      <thead className="text-left text-sm font-normal">
        <tr>
          <th className="px-3 py-5 font-medium">Référence</th>
          <th className="px-3 py-5 font-medium">Client</th>
          <th className="px-3 py-5 font-medium">Date</th>
          <th className="px-3 py-5 font-medium">Validité</th>
          <th className="px-3 py-5 font-medium text-right">Montant</th>
          <th className="px-3 py-5 font-medium">Statut</th>
          <th className="py-5 pl-6 pr-3 text-right">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {quotes.length === 0 ? (
          <tr>
            <td colSpan={7} className="text-center py-8 text-gray-500">
              Aucun devis trouvé
            </td>
          </tr>
        ) : (
          quotes.map((quote) => {
            const statusConfig = STATUS_CONFIG[quote.status];
            const StatusIcon = statusConfig.icon;
            const expired = isExpired(quote);

            return (
              <tr key={quote._id} className="border-b last:border-none text-sm">
                <td className="whitespace-nowrap px-3 py-4 font-medium">
                  {quote.reference}
                </td>
                <td className="px-3 py-4">
                  {quote.client ? (
                    <div>
                      <div className="font-medium">{quote.client.nomComplet}</div>
                      {quote.client.tel && (
                        <div className="text-xs text-gray-500">
                          {quote.client.tel}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">Non renseigné</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  {formatDate(quote.quoteDate || quote.createdAt)}
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  {quote.validUntil ? (
                    <span className={expired ? "text-red-600 font-medium" : ""}>
                      {formatDate(quote.validUntil)}
                      {expired && " (Expiré)"}
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-right font-semibold">
                  {quote.total.toFixed(2)} FCFA
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <Badge className={cn("gap-1", statusConfig.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                </td>
                <td className="whitespace-nowrap py-4 pl-6 pr-3 text-right">
                  <div className="flex justify-end gap-2">
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
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};

export default QuotesTableDesktop;