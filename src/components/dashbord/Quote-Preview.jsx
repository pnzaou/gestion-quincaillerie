import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export const QuotePreview = ({ open, onOpenChange, quote, onPrint }) => {
  if (!quote) return null;

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Aperçu du devis</span>
            <Button
              onClick={onPrint}
              size="sm"
              className="bg-[#0084D1] text-white hover:bg-[#006BB3]"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white text-black p-8 border rounded-lg">
          {/* En-tête */}
          <div className="mb-8 border-b-2 border-gray-800 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              DEVIS
            </h1>
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-semibold">{quote.reference}</p>
              <p>Date: {formatDate(quote.quoteDate || quote.createdAt)}</p>
              {quote.validUntil && (
                <p className="text-amber-600">
                  Valide jusqu'au: {formatDate(quote.validUntil)}
                </p>
              )}
            </div>
          </div>

          {/* Informations client */}
          {quote.client && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                CLIENT
              </h2>
              <div className="text-sm text-gray-700">
                <p className="font-semibold">{quote.client.nomComplet}</p>
                {quote.client.tel && <p>Tél: {quote.client.tel}</p>}
                {quote.client.email && <p>Email: {quote.client.email}</p>}
                {quote.client.adresse && <p>Adresse: {quote.client.adresse}</p>}
              </div>
            </div>
          )}

          {/* Tableau des produits */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left py-2 text-sm font-bold text-gray-900">
                  PRODUIT
                </th>
                <th className="text-center py-2 text-sm font-bold text-gray-900">
                  QUANTITÉ
                </th>
                <th className="text-right py-2 text-sm font-bold text-gray-900">
                  PRIX UNITAIRE
                </th>
                <th className="text-right py-2 text-sm font-bold text-gray-900">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="py-3 text-sm text-gray-800">
                    <div className="font-medium">
                      {item.product?.nom || item.product}
                    </div>
                    {item.product?.reference && (
                      <div className="text-xs text-gray-500">
                        Réf: {item.product.reference}
                      </div>
                    )}
                  </td>
                  <td className="text-center py-3 text-sm text-gray-800 font-semibold">
                    {item.quantity}
                  </td>
                  <td className="text-right py-3 text-sm text-gray-800">
                    {item.price.toFixed(2)} FCFA
                  </td>
                  <td className="text-right py-3 text-sm text-gray-800 font-semibold">
                    {(item.price * item.quantity).toFixed(2)} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Sous-total:</span>
                <span className="font-medium">
                  {(quote.total / (1 - (quote.remise || 0) / 100)).toFixed(2)} FCFA
                </span>
              </div>
              {quote.remise > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Remise ({quote.remise}%):</span>
                  <span>
                    -{((quote.total / (1 - quote.remise / 100)) * (quote.remise / 100)).toFixed(2)} FCFA
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-[#0084D1]">
                  {quote.total.toFixed(2)} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-2">NOTES</h3>
              <p className="text-sm text-gray-700">{quote.notes}</p>
            </div>
          )}

          {/* Pied de page */}
          <div className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
            <p>
              Établi par: {quote.createdBy?.nom} {quote.createdBy?.prenom}
            </p>
            <p className="mt-1">Merci pour votre confiance</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Composant pour l'impression
export const QuotePrint = ({ quote }) => {
  if (!quote) return null;

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="quote-print">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          * {
            visibility: hidden;
          }
          .quote-print, .quote-print * {
            visibility: visible !important;
          }
          .quote-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            padding: 2cm !important;
            background: white !important;
            color: black !important;
          }
        }
        @media screen {
          .quote-print {
            display: none;
          }
        }
      `}</style>

      {/* Contenu identique au preview */}
      <div className="mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">DEVIS</h1>
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-semibold">{quote.reference}</p>
          <p>Date: {formatDate(quote.quoteDate || quote.createdAt)}</p>
          {quote.validUntil && (
            <p className="text-amber-600">
              Valide jusqu'au: {formatDate(quote.validUntil)}
            </p>
          )}
        </div>
      </div>

      {quote.client && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">CLIENT</h2>
          <div className="text-sm text-gray-700">
            <p className="font-semibold">{quote.client.nomComplet}</p>
            {quote.client.tel && <p>Tél: {quote.client.tel}</p>}
            {quote.client.email && <p>Email: {quote.client.email}</p>}
            {quote.client.adresse && <p>Adresse: {quote.client.adresse}</p>}
          </div>
        </div>
      )}

      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="text-left py-2 text-sm font-bold text-gray-900">PRODUIT</th>
            <th className="text-center py-2 text-sm font-bold text-gray-900">QUANTITÉ</th>
            <th className="text-right py-2 text-sm font-bold text-gray-900">PRIX UNITAIRE</th>
            <th className="text-right py-2 text-sm font-bold text-gray-900">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {quote.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="py-3 text-sm text-gray-800">
                <div className="font-medium">{item.product?.nom || item.product}</div>
                {item.product?.reference && (
                  <div className="text-xs text-gray-500">Réf: {item.product.reference}</div>
                )}
              </td>
              <td className="text-center py-3 text-sm text-gray-800 font-semibold">
                {item.quantity}
              </td>
              <td className="text-right py-3 text-sm text-gray-800">
                {item.price.toFixed(2)} FCFA
              </td>
              <td className="text-right py-3 text-sm text-gray-800 font-semibold">
                {(item.price * item.quantity).toFixed(2)} FCFA
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Sous-total:</span>
            <span className="font-medium">
              {(quote.total / (1 - (quote.remise || 0) / 100)).toFixed(2)} FCFA
            </span>
          </div>
          {quote.remise > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Remise ({quote.remise}%):</span>
              <span>
                -{((quote.total / (1 - quote.remise / 100)) * (quote.remise / 100)).toFixed(2)} FCFA
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>{quote.total.toFixed(2)} FCFA</span>
          </div>
        </div>
      </div>

      {quote.notes && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-2">NOTES</h3>
          <p className="text-sm text-gray-700">{quote.notes}</p>
        </div>
      )}

      <div className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
        <p>Établi par: {quote.createdBy?.nom} {quote.createdBy?.prenom}</p>
        <p className="mt-1">Merci pour votre confiance</p>
      </div>
    </div>
  );
};