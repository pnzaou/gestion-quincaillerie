import { Package, AlertTriangle, ArrowUpDown } from 'lucide-react';
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
import { formatCurrency, formatNumber } from '@/utils/formatters';

export const ReportDetailsInventory = ({ report }) => {
  const { inventory } = report.data;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valeur totale stock
            </CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{formatCurrency(inventory.totalValue)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatNumber(inventory.totalProducts)} produits
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produits en rupture
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="stat-value text-destructive">{formatNumber(inventory.outOfStock)}</div>
            <p className="text-sm text-muted-foreground mt-1">À commander</p>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock faible</CardTitle>
            <AlertTriangle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="stat-value text-warning">{formatNumber(inventory.lowStock)}</div>
            <p className="text-sm text-muted-foreground mt-1">À surveiller</p>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mouvements</CardTitle>
            <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-success font-semibold">
                  +{formatNumber(inventory.movements.entries)}
                </span>
                <span className="text-sm text-muted-foreground ml-1">entrées</span>
              </div>
              <div>
                <span className="text-destructive font-semibold">
                  -{formatNumber(inventory.movements.exits)}
                </span>
                <span className="text-sm text-muted-foreground ml-1">sorties</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Value Products Table */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base">Top 10 produits par valeur</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Valeur totale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.topValueProducts.map((product, index) => (
                  <TableRow key={product.product} className="table-row-hover">
                    <TableCell className="font-medium">
                      <span className="text-muted-foreground mr-2">#{index + 1}</span>
                      {product.productName}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(product.quantity)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.unitPrice)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(product.totalValue)}
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
