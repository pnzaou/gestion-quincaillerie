import { Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { formatCurrency, formatPercent } from '@/utils/formatters';

export const ReportDetailsFinances = ({ report }) => {
  const { finances } = report.data;

  // Generate sample data for cash flow chart based on report period
  const cashFlowData = [
    { name: 'Sem 1', inflows: finances.cashFlow.inflows * 0.2, outflows: finances.cashFlow.outflows * 0.18 },
    { name: 'Sem 2', inflows: finances.cashFlow.inflows * 0.25, outflows: finances.cashFlow.outflows * 0.22 },
    { name: 'Sem 3', inflows: finances.cashFlow.inflows * 0.28, outflows: finances.cashFlow.outflows * 0.32 },
    { name: 'Sem 4', inflows: finances.cashFlow.inflows * 0.27, outflows: finances.cashFlow.outflows * 0.28 },
  ];

  const netCashFlow = finances.cashFlow.inflows - finances.cashFlow.outflows;
  const netCashFlowPercent = ((netCashFlow / finances.cashFlow.inflows) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Marge brute</CardTitle>
            <Wallet className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="stat-value text-success">{formatCurrency(finances.grossProfit)}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux de marge</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{formatPercent(finances.profitMargin)}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Encaissements</CardTitle>
            <ArrowDownToLine className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{formatCurrency(finances.cashReceived)}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventes à crédit</CardTitle>
            <ArrowUpFromLine className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="stat-value text-warning">{formatCurrency(finances.creditSales)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="kpi-card animate-fade-in bg-success/5 border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-success">Entrées de trésorerie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(finances.cashFlow.inflows)}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in bg-destructive/5 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Sorties de trésorerie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(finances.cashFlow.outflows)}</div>
          </CardContent>
        </Card>

        <Card className={`kpi-card animate-fade-in ${netCashFlow >= 0 ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${netCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
              Flux net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
              {netCashFlow >= 0 ? '+' : ''}
              {formatCurrency(netCashFlow)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{netCashFlowPercent}% des entrées</p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base">Flux de trésorerie</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="colorInflows" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOutflows" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="inflows"
                name="Encaissements"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorInflows)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="outflows"
                name="Décaissements"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorOutflows)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
