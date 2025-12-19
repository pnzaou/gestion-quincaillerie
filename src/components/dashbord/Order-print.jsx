export const OrderPrint = ({ order }) => {
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="order-print">
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
          .order-print, .order-print * {
            visibility: visible !important;
          }
          .order-print {
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
          .order-print {
            display: none;
          }
        }
      `}</style>

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

      {/* Tableau des produits - SANS PRIX */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="text-left py-2 text-sm font-bold text-gray-900">
              PRODUIT
            </th>
            <th className="text-center py-2 text-sm font-bold text-gray-900">
              QUANTITÉ COMMANDÉE
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="py-3 text-sm text-gray-800">
                <div className="font-medium">{item.product.nom}</div>
                {item.product.reference && (
                  <div className="text-xs text-gray-500">
                    Réf: {item.product.reference}
                  </div>
                )}
              </td>
              <td className="text-center py-3 text-sm text-gray-800 font-semibold">
                {item.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Date de livraison attendue */}
      {order.expectedDelivery && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            DATE DE LIVRAISON SOUHAITÉE
          </h3>
          <p className="text-sm text-gray-700">
            {formatDate(order.expectedDelivery)}
          </p>
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
        <p>
          Commandé par: {order.createdBy.nom} {order.createdBy.prenom}
        </p>
        <p className="mt-1">Merci pour votre collaboration</p>
      </div>
    </div>
  );
};