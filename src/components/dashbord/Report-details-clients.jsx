import { Users, UserPlus, CreditCard } from 'lucide-react';
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

export const ReportDetailsClients = ({ report }) => {
  const { clients } = report.data;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total clients
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{formatNumber(clients.totalClients)}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nouveaux clients
            </CardTitle>
            <UserPlus className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="stat-value text-success">+{formatNumber(clients.newClients)}</div>
            <p className="text-sm text-muted-foreground mt-1">Cette période</p>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients actifs
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">{formatNumber(clients.activeClients)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {((clients.activeClients / clients.totalClients) * 100).toFixed(0)}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dettes totales
            </CardTitle>
            <CreditCard className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="stat-value text-warning">{formatCurrency(clients.totalDebt)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatNumber(clients.accounts.activeAccounts)} comptes actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients Table */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base">Top 10 clients</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Chiffre d'affaires</TableHead>
                  <TableHead className="text-right">Achats</TableHead>
                  <TableHead className="text-right">Dette</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.topClients.map((client, index) => (
                  <TableRow key={client.client} className="table-row-hover">
                    <TableCell className="font-medium">
                      <span className="text-muted-foreground mr-2">#{index + 1}</span>
                      {client.clientName}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(client.revenue)}</TableCell>
                    <TableCell className="text-right">{formatNumber(client.purchaseCount)}</TableCell>
                    <TableCell className="text-right">
                      {client.debt > 0 ? (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                          {formatCurrency(client.debt)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          Aucune
                        </Badge>
                      )}
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
