import SaleStatCard from "@/components/dashbord/Sale-stat-card";
import SaleTable from "@/components/dashbord/Sale-table";
import authOptions from "@/lib/auth";
import { getSalesStatistics } from "@/lib/saleStatData";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";
import { AlertCircle, CheckCircle, Clock, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { getServerSession } from "next-auth";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const Page = async ({ searchParams }) => {

    const session = await getServerSession(authOptions)
    const { id: userId, role } = session?.user;
    
    const { cookie, host, protocol } = await preparingServerSideRequest()

    const { page, search, status } = await searchParams
    const page1 = page || 1
    const search1 = search || ""
    const status1 = status || ""

    const stats = await getSalesStatistics({ 
      userId, 
      role 
    });

    const statusParam = status1 ? `&status=${status1}` : ""

    const rep = await fetch(`${protocol}://${host}/api/sale?page=${page1}&limit=10&search=${search1}${statusParam}`, {
        headers: { 'Cookie': cookie }
    })
    
    const { data, totalPages, currentPage } = await rep.json()

    // Convertir status en tableau pour le composant
    const initialStatus = status1 ? status1.split(',').map(s => s.trim()).filter(Boolean) : []
    return (
      <div className="flow-root">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des Ventes
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Consultez et gérez toutes vos transactions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <SaleStatCard
            title="Revenu Total"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            color="#10B981"
            subtitle={`${stats.totalSales} vente${
              stats.totalSales > 1 ? "s" : ""
            }`}
          />

          <SaleStatCard
            title="Dettes Totales"
            value={formatCurrency(stats.totalDebt)}
            icon={AlertCircle}
            color="#EF4444"
            subtitle={`${stats.debtCount} vente${
              stats.debtCount > 1 ? "s" : ""
            } impayée${stats.debtCount > 1 ? "s" : ""}`}
          />

          {/* <SaleStatCard
            title="Ventes Payées"
            value={formatCurrency(stats.totalPaid)}
            icon={CheckCircle}
            color="#0084D1"
            subtitle={`${stats.paidCount} vente${
              stats.paidCount > 1 ? "s" : ""
            } payée${stats.paidCount > 1 ? "s" : ""}`}
          /> */}

          <SaleStatCard
            title="Montant Moyen"
            value={formatCurrency(stats.avgSale)}
            icon={TrendingUp}
            color="#F59E0B"
            subtitle="Par vente"
          />

          {/* <SaleStatCard
            title="Ventes en Attente"
            value={stats.pendingCount}
            icon={Clock}
            color="#8B5CF6"
            subtitle="À traiter"
          /> */}

          <SaleStatCard
            title="Total des Ventes"
            value={stats.totalSales}
            icon={ShoppingBag}
            color="#EC4899"
            subtitle="Toutes périodes"
          />
        </div>

        <SaleTable
          initialSales={data}
          initialTotalPages={totalPages}
          currentPage={currentPage}
          search={search1}
          initialStatus={initialStatus}
        />
      </div>
    );
}

export default Page;
