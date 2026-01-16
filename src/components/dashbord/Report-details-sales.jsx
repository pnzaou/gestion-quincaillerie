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
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const STATUS_COLORS = {
  paid: '#10b981',
  pending: '#f59e0b',
  partial: '#0084D1',
  cancelled: '#ef4444',
};

const STATUS_LABELS = {
  paid: 'Payé',
  pending: 'En attente',
  partial: 'Partiel',
  cancelled: 'Annulé',
};

const PAYMENT_COLORS = ['#0084D1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const ReportDetailsSales = ({ report }) => {
  const { sales } = report.data;

  const statusData = Object.entries(sales.byStatus).map(([key, value]) => ({
    name: STATUS_LABELS[key],
    value: value.count,
    amount: value.amount,
    color: STATUS_COLORS[key],
  }));

  const paymentData = sales.byPaymentMethod.map((pm, index) => ({
    name: pm.method,
    montant: pm.amount,
    count: pm.count,
    fill: PAYMENT_COLORS[index % PAYMENT_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales by Status */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Ventes par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${formatNumber(value)} ventes - ${formatCurrency(props.payload.amount)}`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payments by Method */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Paiements par méthode</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={paymentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="montant" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base">Top 10 produits vendus</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Chiffre d'affaires</TableHead>
                  <TableHead className="text-right">Marge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.topProducts.map((product, index) => (
                  <TableRow key={product.product} className="table-row-hover">
                    <TableCell className="font-medium">
                      <span className="text-muted-foreground mr-2">#{index + 1}</span>
                      {product.productName}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(product.quantity)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                    <TableCell className="text-right text-success">
                      {formatCurrency(product.profit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Top Sellers Table */}
      {sales.topSellers.length > 0 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Top vendeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendeur</TableHead>
                  <TableHead className="text-right">Ventes</TableHead>
                  <TableHead className="text-right">Chiffre d'affaires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.topSellers.map((seller, index) => (
                  <TableRow key={seller.user} className="table-row-hover">
                    <TableCell className="font-medium">
                      <span className="text-muted-foreground mr-2">#{index + 1}</span>
                      {seller.userName}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(seller.salesCount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(seller.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
