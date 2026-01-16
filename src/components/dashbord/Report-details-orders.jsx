import { Package, TrendingUp, TrendingDown, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const STATUS_CONFIG = {
  sent: { label: 'Envoyée', className: 'bg-primary/10 text-primary' },
  confirmed: { label: 'Confirmée', className: 'bg-info/10 text-info' },
  partially_received: { label: 'Partielle', className: 'bg-warning/10 text-warning' },
  completed: { label: 'Terminée', className: 'bg-success/10 text-success' },
  cancelled: { label: 'Annulée', className: 'bg-destructive/10 text-destructive' },
};

export const ReportDetailsOrders = ({ report }) => {
  const { orders } = report.data;
  const priceVariancePercent = ((orders.priceVariance / orders.estimatedTotal) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nombre commandes
            </CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{formatNumber(orders.totalOrders)}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total estimé</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{formatCurrency(orders.estimatedTotal)}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total réel</CardTitle>
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{formatCurrency(orders.actualTotal)}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Écart prix</CardTitle>
            {orders.priceVariance >= 0 ? (
              <TrendingUp className="h-5 w-5 text-warning" />
            ) : (
              <TrendingDown className="h-5 w-5 text-success" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`stat-value ${orders.priceVariance >= 0 ? 'text-warning' : 'text-success'}`}>
              {orders.priceVariance >= 0 ? '+' : ''}
              {formatCurrency(orders.priceVariance)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{priceVariancePercent}% de variation</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Grid */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base">Commandes par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            {Object.entries(orders.byStatus).map(([status, count]) => {
              const config = STATUS_CONFIG[status];
              return (
                <div key={status} className="text-center p-4 rounded-lg bg-muted/50">
                  <Badge className={config.className}>{config.label}</Badge>
                  <div className="text-2xl font-bold mt-2">{count}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Suppliers Table */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Top fournisseurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead className="text-right">Commandes</TableHead>
                  <TableHead className="text-right">Montant total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.topSuppliers.map((supplier, index) => (
                  <TableRow key={supplier.supplier} className="table-row-hover">
                    <TableCell className="font-medium">
                      <span className="text-muted-foreground mr-2">#{index + 1}</span>
                      {supplier.supplierName}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(supplier.ordersCount)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(supplier.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
