import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export const ProductHeader = ({ product }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="w-full md:w-64 h-64 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.nom}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="w-24 h-24 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{product.nom}</h1>
          {product.reference && (
            <p className="text-muted-foreground">Référence: {product.reference}</p>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">
            {product.statut}
          </Badge>
          {product.QteStock <= product.QteAlerte && (
            <Badge variant="outline" className="border-[#FFC107] text-[#FFC107]">
              Alerte stock
            </Badge>
          )}
        </div>
        
        {product.description && (
          <p className="text-foreground leading-relaxed">{product.description}</p>
        )}
      </div>
    </div>
  );
};
