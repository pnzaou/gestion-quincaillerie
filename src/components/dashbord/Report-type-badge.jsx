import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const typeConfig = {
  daily: { label: 'Quotidien', className: 'bg-badge-daily text-white' },
  weekly: { label: 'Hebdomadaire', className: 'bg-badge-weekly text-white' },
  monthly: { label: 'Mensuel', className: 'bg-badge-monthly text-white' },
  quarterly: { label: 'Trimestriel', className: 'bg-badge-quarterly text-white' },
  yearly: { label: 'Annuel', className: 'bg-badge-yearly text-white' },
  custom: { label: 'Personnalisé', className: 'bg-badge-custom text-white' },
};

export const ReportTypeBadge = ({ type, className }) => {
  const config = typeConfig[type];
  return (
    <Badge className={cn(config.className, 'font-medium', className)}>
      {config.label}
    </Badge>
  );
};
