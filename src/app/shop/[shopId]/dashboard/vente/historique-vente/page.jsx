import SaleStatCard from "@/components/dashbord/Sale-stat-card";
import SaleTable from "@/components/dashbord/Sale-table";
import authOptions from "@/lib/auth";
import { getSalesStatistics } from "@/lib/saleStatData";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";
import { AlertCircle, CheckCircle, Clock, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { getServerSession } from "next-auth";
import { Suspense } from "react";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const Page = async ({ searchParams, params }) => {
    const { shopId } = await params;
    const session = await getServerSession(authOptions)
    const { id: userId, role } = session?.user;
    
    const { cookie, host, protocol } = await preparingServerSideRequest()

    const { page, search, status } = await searchParams
    const page1 = page || 1
    const search1 = search || ""
    const status1 = status || ""

    const stats = await getSalesStatistics({ 
      userId, 
      role,
      businessId: shopId
    });

    const statusParam = status1 ? `&status=${status1}` : ""

    const rep = await fetch(`${protocol}://${host}/api/sale?page=${page1}&limit=10&search=${search1}${statusParam}&businessId=${shopId}`, {
        headers: { 'Cookie': cookie }
    })
    
    const { data, totalPages, currentPage } = await rep.json()

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
            subtitle={`${stats.totalSales} vente${stats.totalSales > 1 ? "s" : ""}`}
          />

          <SaleStatCard
            title="Dettes Totales"
            value={formatCurrency(stats.totalDebt)}
            icon={AlertCircle}
            color="#EF4444"
            subtitle={`${stats.debtCount} vente${stats.debtCount > 1 ? "s" : ""} impayée${stats.debtCount > 1 ? "s" : ""}`}
          />

          <SaleStatCard
            title="Montant Moyen"
            value={formatCurrency(stats.avgSale)}
            icon={TrendingUp}
            color="#F59E0B"
            subtitle="Par vente"
          />

          <SaleStatCard
            title="Total des Ventes"
            value={stats.totalSales}
            icon={ShoppingBag}
            color="#EC4899"
            subtitle="Toutes périodes"
          />
        </div>

        <Suspense fallback={<SaleTableSkeleton />}>
          <SaleTable
            initialSales={data}
            initialTotalPages={totalPages}
            currentPage={currentPage}
            search={search1}
            initialStatus={initialStatus}
          />
        </Suspense>
      </div>
    );
}

function SaleTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filtres skeleton */}
      <div className="flex justify-between items-center gap-3">
        <div className="flex gap-3 flex-1">
          <div className="h-10 w-96 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg bg-gray-50 p-2">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center gap-2">
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export default Page;