import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";


export const InvoicePreview = ({ open, onOpenChange, sale, payments, onPrint }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const subtotal = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Aperçu de la facture</span>
            <Button onClick={onPrint} size="sm" className="bg-[#0084D1] text-white hover:bg-[#006BB3]">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white text-black p-8 border rounded-lg">
          {/* En-tête */}
          <div className="mb-8 border-b-2 border-gray-800 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">FACTURE</h1>
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-semibold">{sale.reference}</p>
              <p>{formatDate(sale.dateExacte)}</p>
            </div>
          </div>

          {/* Informations client */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">CLIENT</h2>
            {sale.client ? (
              <div className="text-sm text-gray-700">
                <p className="font-semibold">{sale.client.nomComplet}</p>
                <p>Tél: {sale.client.tel}</p>
                {sale.client.email && <p>Email: {sale.client.email}</p>}
                {sale.client.adresse && <p>Adresse: {sale.client.adresse}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-700">Client anonyme</p>
            )}
          </div>

          {/* Tableau des produits */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left py-2 text-sm font-bold text-gray-900">PRODUIT</th>
                <th className="text-center py-2 text-sm font-bold text-gray-900">QTÉ</th>
                <th className="text-right py-2 text-sm font-bold text-gray-900">P.U.</th>
                <th className="text-right py-2 text-sm font-bold text-gray-900">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="py-3 text-sm text-gray-800">
                    <div className="font-medium">{item.product.nom}</div>
                    {item.product.reference && (
                      <div className="text-xs text-gray-500">Réf: {item.product.reference}</div>
                    )}
                  </td>
                  <td className="text-center py-3 text-sm text-gray-800">{item.quantity}</td>
                  <td className="text-right py-3 text-sm text-gray-800">{formatCurrency(item.price)}</td>
                  <td className="text-right py-3 text-sm font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="ml-auto w-80 mb-8">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Sous-total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {sale.remise && sale.remise > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Remise</span>
                  <span>- {sale.remise} %</span>
                </div>
              )}
              <div className="border-t-2 border-gray-800 pt-2 flex justify-between text-lg font-bold text-gray-900">
                <span>TOTAL</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
              {payments.length > 0 && (
                <>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Total payé</span>
                    <span>{formatCurrency(totalPaid)}</span>
                  </div>
                  {sale.amountDue && sale.amountDue > 0 && (
                    <div className="flex justify-between text-orange-600 font-bold">
                      <span>Montant dû</span>
                      <span>{formatCurrency(sale.amountDue)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Paiements */}
          {payments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-2">PAIEMENTS</h3>
              <div className="space-y-1 text-xs text-gray-700">
                {payments.map((payment) => (
                  <div key={payment._id} className="flex justify-between">
                    <span>{formatDate(payment.createdAt)} - {payment.method}</span>
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pied de page */}
          <div className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
            <p>Vendeur: {sale.vendeur.nom}</p>
            <p className="mt-1">Merci pour votre confiance</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
