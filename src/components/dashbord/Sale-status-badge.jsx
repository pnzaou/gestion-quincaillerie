import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

export const SaleStatusBadge = ({ status }) => {
  const statusConfig = {
    paid: {
      label: "Payé",
      icon: CheckCircle2,
      className: "bg-[#1ECA5C]/10 text-[#1ECA5C] hover:bg-[#1ECA5C]/20 border-[#1ECA5C]/20"
    },
    pending: {
      label: "Dette",
      icon: Clock,
      className: "bg-[#E19209]/10 text-[#E19209] hover:bg-[#E19209]/20 border-[#E19209]/20"
    },
    partial: {
      label: "Paiement partiel",
      icon: AlertCircle,
      className: "bg-[#0B64F4]/10 text-[#0B64F4] hover:bg-[#0B64F4]/20 border-[#0B64F4]/20"
    },
    cancelled: {
      label: "Annulé",
      icon: XCircle,
      className: "bg-[#EF4646]/10 text-[#EF4646] hover:bg-[#EF4646]/20 border-[#EF4646]/20"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};
