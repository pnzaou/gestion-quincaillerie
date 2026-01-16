import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig = {
  draft: { label: 'Brouillon', className: 'bg-status-draft text-white' },
  finalized: { label: 'Finalisé', className: 'bg-status-finalized text-white' },
  archived: { label: 'Archivé', className: 'bg-status-archived text-white' },
};

export const ReportStatusBadge = ({ status, className }) => {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, 'font-medium border-0', className)}>
      {config.label}
    </Badge>
  );
};
