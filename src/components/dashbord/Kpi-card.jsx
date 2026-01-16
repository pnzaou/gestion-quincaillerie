import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const KpiCard = ({ title, value, change, icon, className }) => {
  const isPositive = change && change.percentage > 0;
  const isNegative = change && change.percentage < 0;
  const isNeutral = !change || change.percentage === 0;

  return (
    <Card className={cn('kpi-card animate-fade-in', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="stat-value">{value}</div>
        {change && (
          <div
            className={cn(
              'flex items-center gap-1 mt-2 text-sm font-medium',
              isPositive && 'text-success',
              isNegative && 'text-destructive',
              isNeutral && 'text-muted-foreground'
            )}
          >
            {isPositive && <TrendingUp className="h-4 w-4" />}
            {isNegative && <TrendingDown className="h-4 w-4" />}
            {isNeutral && <Minus className="h-4 w-4" />}
            <span>
              {change.percentage > 0 ? '+' : ''}
              {change.percentage.toFixed(1)}% vs période précédente
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
