import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingCart, Target } from "lucide-react";

export const MarginAnalyticsCard = ({ analytics }) => {
  const margePercentage = analytics.totalDepense > 0 
    ? ((analytics.marge / analytics.totalDepense) * 100).toFixed(2)
    : 0;

  const progressPercentage = analytics.progressPercentage?.toFixed(2) || 0;

  return (
    <Card className="shadow-lg bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Analyse de marge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticItem
            icon={<ShoppingCart className="w-5 h-5" />}
            label="Total dépensé"
            value={`${analytics.totalDepense.toFixed(2)} fcfa`}
            variant="default"
          />
          <AnalyticItem
            icon={<Target className="w-5 h-5" />}
            label="Total attendu"
            value={`${analytics.totalAttendu.toFixed(2)} fcfa`}
            subValue={`${progressPercentage}% atteint`}
            variant="info"
          />
          <AnalyticItem
            icon={<DollarSign className="w-5 h-5" />}
            label="Total vendu"
            value={`${analytics.totalVendu.toFixed(2)} fcfa`}
            variant="warning"
          />
          <AnalyticItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="Marge"
            value={`${analytics.marge.toFixed(2)} fcfa`}
            subValue={`${margePercentage}%`}
            variant={analytics.marge >= 0 ? "success" : "destructive"}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const AnalyticItem = ({
  icon,
  label,
  value,
  subValue,
  variant = "default"
}) => {
  const variantClasses = {
    default: "bg-muted",
    success: "bg-blue-600/10 border-blue-600/20",
    warning: "bg-yellow-600/10 border-yellow-600/20",
    info: "bg-cyan-500/10 border-cyan-500/20",
    destructive: "bg-red-600/10 border-red-600/20"
  };

  const iconClasses = {
    default: "text-muted-foreground",
    success: "text-blue-600",
    warning: "text-yellow-600",
    info: "text-cyan-500",
    destructive: "text-red-600"
  };

  console.log(variantClasses[variant]);
  

  return (
    <div className={`p-4 rounded-lg border ${variantClasses[variant]} transition-all hover:shadow-md`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={iconClasses[variant]}>{icon}</div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {subValue && (
        <p className={`text-sm font-medium mt-1 ${iconClasses[variant]}`}>{subValue}</p>
      )}
    </div>
  );
};
