import OrderTable from "@/components/dashbord/Order-table";
import OrderStatCard from "@/components/dashbord/Order-stat-card";
import { getOrdersStatistics } from "@/lib/orderStatData";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";
import { Package, CheckCircle, Clock, XCircle, TrendingUp, DollarSign } from "lucide-react";
import { Suspense } from "react"; // ✅ Ajout

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const Page = async ({ searchParams, params }) => {
  const { shopId } = await params;
  const { cookie, host, protocol } = await preparingServerSideRequest();

  const { page, search, status, startDate, endDate } = await searchParams;
  const page1 = page || 1;
  const search1 = search || "";
  const status1 = status || "";
  const startDate1 = startDate || "";
  const endDate1 = endDate || "";

  const stats = await getOrdersStatistics({
    businessId: shopId,
    startDate: startDate1 ? new Date(startDate1) : null,
    endDate: endDate1 ? new Date(endDate1) : null
  });

  const statusParam = status1 ? `&status=${status1}` : "";
  const dateParams = `${startDate1 ? `&startDate=${startDate1}` : ""}${endDate1 ? `&endDate=${endDate1}` : ""}`;

  const rep = await fetch(
    `${protocol}://${host}/api/order?page=${page1}&limit=10&search=${search1}${statusParam}${dateParams}&businessId=${shopId}`,
    {
      headers: { Cookie: cookie },
    }
  );

  const { data, totalPages, currentPage } = await rep.json();

  const initialStatus = status1
    ? status1.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="flow-root">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Gestion des Commandes
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Consultez et gérez toutes vos commandes fournisseurs
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <OrderStatCard
          title="Total"
          value={stats.totalOrders}
          icon={Package}
          color="#6366F1"
          subtitle="Toutes les commandes"
        />

        <OrderStatCard
          title="Brouillon"
          value={stats.draftCount}
          icon={Clock}
          color="#94A3B8"
          subtitle="En préparation"
        />

        <OrderStatCard
          title="Envoyées"
          value={stats.sentCount}
          icon={TrendingUp}
          color="#3B82F6"
          subtitle="Aux fournisseurs"
        />

        <OrderStatCard
          title="Confirmées"
          value={stats.confirmedCount}
          icon={CheckCircle}
          color="#F59E0B"
          subtitle="Par fournisseurs"
        />

        <OrderStatCard
          title="Réception partielle"
          value={stats.partiallyReceivedCount}
          icon={Package}
          color="#EC4899"
          subtitle="En cours"
        />

        <OrderStatCard
          title="Terminées"
          value={stats.completedCount}
          icon={CheckCircle}
          color="#10B981"
          subtitle="Reçues"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <OrderStatCard
          title="Montant Total"
          value={formatCurrency(stats.totalAmount)}
          icon={DollarSign}
          color="#10B981"
          subtitle="Hors annulées"
        />

        <OrderStatCard
          title="Montant Moyen"
          value={formatCurrency(stats.averageAmount)}
          icon={TrendingUp}
          color="#F59E0B"
          subtitle="Par commande"
        />
      </div>

      {/* ✅ Table avec Suspense + Skeleton */}
      <Suspense fallback={<OrderTableSkeleton />}>
        <OrderTable
          initialOrders={data}
          initialTotalPages={totalPages}
          currentPage={currentPage}
          search={search1}
          initialStatus={initialStatus}
          initialStartDate={startDate1}
          initialEndDate={endDate1}
        />
      </Suspense>
    </div>
  );
};

// ✅ Skeleton joli pour OrderTable
function OrderTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filtres skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-96 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
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
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export default Page;