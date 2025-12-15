import OrderTable from "@/components/dashbord/Order-table";
import OrderStatCard from "@/components/dashbord/Order-stat-card";
import { getOrdersStatistics } from "@/lib/orderStatData";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";
import { Package, CheckCircle, Clock, XCircle, TrendingUp, DollarSign } from "lucide-react";

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

  // Récupérer les statistiques
  const stats = await getOrdersStatistics({
    businessId: shopId,
    startDate: startDate1 ? new Date(startDate1) : null,
    endDate: endDate1 ? new Date(endDate1) : null
  });

  const statusParam = status1 ? `&status=${status1}` : "";
  const dateParams = `${startDate1 ? `&startDate=${startDate1}` : ""}${endDate1 ? `&endDate=${endDate1}` : ""}`;

  // Récupérer les commandes
  const rep = await fetch(
    `${protocol}://${host}/api/order?page=${page1}&limit=10&search=${search1}${statusParam}${dateParams}&businessId=${shopId}`,
    {
      headers: { Cookie: cookie },
    }
  );

  const { data, totalPages, currentPage } = await rep.json();

  // Convertir status en tableau pour le composant
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

      {/* Table des commandes */}
      <OrderTable
        initialOrders={data}
        initialTotalPages={totalPages}
        currentPage={currentPage}
        search={search1}
        initialStatus={initialStatus}
        initialStartDate={startDate1}
        initialEndDate={endDate1}
      />
    </div>
  );
};

export default Page;