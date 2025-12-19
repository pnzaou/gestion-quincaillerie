import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Package2, TrendingDown } from "lucide-react";

export const ProductInfoCard = ({ product }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="w-5 h-5" />
          Informations du produit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Prix de vente (Gros)" value={`${product.prixVenteEnGros.toFixed(2)} FCFA`} />
          {product.prixAchatDetail && (
            <InfoItem label="Prix d'achat (Détail)" value={`${product.prixAchatDetail.toFixed(2)} FCFA`} />
          )}
          {product.prixVenteDetail && (
            <InfoItem label="Prix de vente (Détail)" value={`${product.prixVenteDetail.toFixed(2)} FCFA`} />
          )}
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold mb-3 text-foreground">Stock</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem label="Quantité initiale" value={product.QteInitial.toString()} />
            <InfoItem label="Stock actuel" value={product.QteStock.toString()} />
            <InfoItem 
              label="Seuil d'alerte" 
              value={product.QteAlerte.toString()}
              icon={<TrendingDown className="w-4 h-4 text-warning" />}
            />
          </div>
        </div>
        
        {product.dateExpiration && (
          <div className="border-t pt-4 mt-4">
            <InfoItem 
              label="Date d'expiration" 
              value={new Date(product.dateExpiration).toLocaleDateString('fr-FR')}
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const InfoItem = ({ label, value, icon }) => (
  <div className="space-y-1">
    <p className="text-sm text-muted-foreground flex items-center gap-2">
      {icon}
      {label}
    </p>
    <p className="text-lg font-semibold text-foreground">{value}</p>
  </div>
);