import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export const OrderPreview = ({ open, onOpenChange, order, onPrint }) => {
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
    }).format(new Date(date));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Aperçu du bon de commande</span>
            <Button onClick={onPrint} size="sm" className="bg-[#0084D1] text-white hover:bg-[#006BB3]">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white text-black p-8 border rounded-lg">
          {/* En-tête */}
          <div className="mb-8 border-b-2 border-gray-800 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">BON DE COMMANDE</h1>
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-semibold">{order.reference}</p>
              <p>{formatDate(order.orderDate)}</p>
            </div>
          </div>

          {/* Informations fournisseur */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">FOURNISSEUR</h2>
            {order.supplier ? (
              <div className="text-sm text-gray-700">
                <p className="font-semibold">{order.supplier.nom}</p>
                {order.supplier.tel && <p>Tél: {order.supplier.tel}</p>}
                {order.supplier.email && <p>Email: {order.supplier.email}</p>}
                {order.supplier.adresse && <p>Adresse: {order.supplier.adresse}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-700">Non spécifié</p>
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
              {order.items.map((item, index) => (
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

          {/* Total */}
          <div className="ml-auto w-80 mb-8">
            <div className="space-y-2 text-sm">
              <div className="border-t-2 border-gray-800 pt-2 flex justify-between text-lg font-bold text-gray-900">
                <span>TOTAL</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Date de livraison attendue */}
          {order.expectedDelivery && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-2">DATE DE LIVRAISON ATTENDUE</h3>
              <p className="text-sm text-gray-700">{formatDate(order.expectedDelivery)}</p>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-2">NOTES</h3>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}

          {/* Pied de page */}
          <div className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
            <p>Commandé par: {order.createdBy.nom} {order.createdBy.prenom}</p>
            <p className="mt-1">Merci pour votre collaboration</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};