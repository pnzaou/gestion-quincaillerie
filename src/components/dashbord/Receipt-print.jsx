
export const ReceiptPrint = ({ sale, payments }) => {
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
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const subtotal = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="receipt-print">
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
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
          .receipt-print, .receipt-print * {
            visibility: visible !important;
          }
          .receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            display: block !important;
            font-family: 'Courier New', monospace !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
            padding: 5mm !important;
            background: white !important;
            color: black !important;
          }
        }
        @media screen {
          .receipt-print {
            display: none;
          }
        }
      `}</style>

      {/* En-tête centré */}
      <div className="text-center mb-3 border-b border-dashed border-gray-800 pb-2">
        <div className="text-lg font-bold">TICKET DE VENTE</div>
        <div className="text-xs mt-1">{sale.reference}</div>
        <div className="text-xs">{formatDate(sale.dateExacte)}</div>
      </div>

      {/* Client */}
      {sale.client && (
        <div className="mb-3 text-xs border-b border-dashed border-gray-800 pb-2">
          <div className="font-bold">CLIENT:</div>
          <div>{sale.client.nomComplet}</div>
          <div>Tel: {sale.client.tel}</div>
        </div>
      )}

      {/* Articles */}
      <div className="mb-3 border-b border-dashed border-gray-800 pb-2">
        {sale.items.map((item, index) => (
          <div key={index} className="mb-2 text-xs">
            <div className="flex justify-between font-medium">
              <span>{item.product.nom}</span>
            </div>
            {item.product.reference && (
              <div className="text-[10px] text-gray-600">Ref: {item.product.reference}</div>
            )}
            <div className="flex justify-between">
              <span>{item.quantity} x {formatCurrency(item.price)}</span>
              <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Totaux */}
      <div className="mb-3 text-xs">
        <div className="flex justify-between mb-1">
          <span>Sous-total:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {sale.remise && sale.remise > 0 && (
          <div className="flex justify-between mb-1">
            <span>Remise:</span>
            <span>- {sale.remise} %</span>
          </div>
        )}
        <div className="border-t-2 border-gray-800 pt-1 mt-1 flex justify-between text-sm font-bold">
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
      </div>

      {/* Paiements */}
      {payments.length > 0 && (
        <div className="mb-3 text-xs border-b border-dashed border-gray-800 pb-2">
          <div className="font-bold mb-1">PAIEMENTS:</div>
          {payments.map((payment) => (
            <div key={payment._id} className="flex justify-between mb-1">
              <span className="text-[10px]">{payment.method === "account" ? "Compte client" : payment.method}</span>
              <span>{formatCurrency(payment.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between font-medium mt-1">
            <span>Total payé:</span>
            <span>{formatCurrency(totalPaid)}</span>
          </div>
          {sale.amountDue && sale.amountDue > 0 && (
            <div className="flex justify-between font-bold mt-1">
              <span>Montant dû:</span>
              <span>{formatCurrency(sale.amountDue)}</span>
            </div>
          )}
        </div>
      )}

      {/* Pied de page */}
      <div className="text-center text-[10px] mt-3">
        <div className="mb-1">Vendeur: {sale.vendeur.nom}</div>
        <div className="border-t border-dashed border-gray-800 pt-2 mt-2">
          Merci pour votre visite!
        </div>
      </div>
    </div>
  );
};
