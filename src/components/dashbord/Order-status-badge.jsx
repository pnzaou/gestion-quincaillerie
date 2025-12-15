import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    draft: {
      label: "Brouillon",
      className: "bg-gray-100 text-gray-800 border-gray-300",
    },
    sent: {
      label: "Envoyée",
      className: "bg-blue-100 text-blue-800 border-blue-300",
    },
    confirmed: {
      label: "Confirmée",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    partially_received: {
      label: "Réception partielle",
      className: "bg-purple-100 text-purple-800 border-purple-300",
    },
    completed: {
      label: "Terminée",
      className: "bg-green-100 text-green-800 border-green-300",
    },
    cancelled: {
      label: "Annulée",
      className: "bg-red-100 text-red-800 border-red-300",
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};

export default OrderStatusBadge;