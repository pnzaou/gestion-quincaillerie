import { Badge } from "@/components/ui/badge";

const TransactionTypeConfig = {
  deposit: {
    label: "Dépôt",
    variant: "default",
    className: "bg-[#1ECA5D]/10 text-[#1ECA5D] hover:bg-[#1ECA5D]/20 border-[#1ECA5D]/20",
  },
  withdrawal: {
    label: "Retrait",
    variant: "default",
    className: "bg-[#F59F0A]/10 text-[#F59F0A] hover:bg-[#F59F0A]/20 border-[#F59F0A]/20",
  },
  adjustment: {
    label: "Ajustement",
    variant: "default",
    className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
  },
  refund: {
    label: "Remboursement",
    variant: "default",
    className: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20",
  },
};

const TransactionTypeBadge = ({ type }) => {
  const config = TransactionTypeConfig[type];
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

export default TransactionTypeBadge;
