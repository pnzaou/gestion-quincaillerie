import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import { KpiCard } from './Kpi-card';

export const ReportDetailsOverview = ({ report }) => {
  const { data, comparison } = report;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Chiffre d'affaires"
        value={formatCurrency(data.sales.totalRevenue)}
        change={comparison?.changes.revenue}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <KpiCard
        title="Nombre de ventes"
        value={formatNumber(data.sales.totalSales)}
        change={comparison?.changes.sales}
        icon={<ShoppingCart className="h-5 w-5" />}
      />
      <KpiCard
        title="Clients actifs"
        value={formatNumber(data.clients.activeClients)}
        change={comparison?.changes.clients}
        icon={<Users className="h-5 w-5" />}
      />
      <KpiCard
        title="Marge bénéficiaire"
        value={formatPercent(data.finances.profitMargin)}
        change={comparison?.changes.profitMargin}
        icon={<TrendingUp className="h-5 w-5" />}
      />
    </div>
  );
};
