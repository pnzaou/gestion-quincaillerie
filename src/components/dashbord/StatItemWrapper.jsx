import { countOrdersToReceive, getMonthRevenue, getYearRevenue, getStockAlerts, getTodayStats, getPreviousMonthRevenue, getTotalDebts } from "@/lib/dashboardData";
import { TrendingUp, Calendar, ChevronLeft, ShoppingCart, Truck, ArrowUpRight, Package, BanknoteArrowUp, BanknoteArrowDown } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { hasPermissionWithOverrides } from "@/lib/permissionOverrides";

const StatItem = ({
  icon: Icon,
  label,
  value,
  currency = false,
  href,
  linkAriaLabel,
  soonCount = null,
  outOfStockCount = null,
}) => {
  const hasLink = Boolean(href);

  return (
    <div className="relative flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
      <div className="p-2 rounded-md bg-gray-50">
        {Icon ? <Icon className="w-6 h-6 text-[#004871]" /> : null}
      </div>

      {label === "Alertes stock" &&
      soonCount !== null &&
      outOfStockCount !== null ? (
        <div>
          <div className="text-xs text-muted-foreground truncate">{label}</div>
          <div className="flex items-center space-x-2">
            <div className="text-lg font-semibold text-sky-600 truncate">
              {soonCount + outOfStockCount}
            </div>
            {(outOfStockCount > 0 || soonCount > 0) && (
              <div className="flex space-x-1">
                {outOfStockCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {outOfStockCount} rupture
                  </Badge>
                )}
                {soonCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {soonCount} bientôt
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground truncate">{label}</div>
          <div className="text-lg font-semibold text-sky-600 truncate">
            {value + (currency ? " fcfa" : "")}
          </div>
        </div>
      )}

      {hasLink && (
        <div className="absolute bottom-2 right-2">
          <Link
            href={href}
            aria-label={linkAriaLabel || `Voir ${label}`}
            className="inline-flex items-center justify-center p-2 rounded-full bg-gray-100 hover:bg-sky-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

const StatItemWrapper = async ({ businessId }) => {
  const objectId = new mongoose.Types.ObjectId(businessId);
  
  // ✅ Récupérer session
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || session?.user?._id;
  const userRole = session?.user?.role;
  const userBusinessId = session?.user?.business || null;

  // Helper pour vérifier permission dashboard
  const canViewDashboardStat = async (action) => {
    return await hasPermissionWithOverrides(
      userId, 
      userRole, 
      userBusinessId, 
      RESOURCES.DASHBOARD, 
      action
    );
  };

  // ✅ Vérifier permissions pour chaque stat
  const canViewRevenueToday = await canViewDashboardStat(ACTIONS.VIEW_REVENUE_TODAY);
  const canViewRevenueMonth = await canViewDashboardStat(ACTIONS.VIEW_REVENUE_MONTH);
  const canViewRevenuePreviousMonth = await canViewDashboardStat(ACTIONS.VIEW_REVENUE_PREVIOUS_MONTH);
  const canViewRevenueYear = await canViewDashboardStat(ACTIONS.VIEW_REVENUE_YEAR);
  const canViewSalesCount = await canViewDashboardStat(ACTIONS.VIEW_SALES_COUNT);
  const canViewStockAlerts = await canViewDashboardStat(ACTIONS.VIEW_STOCK_ALERTS);
  const canViewOrdersPending = await canViewDashboardStat(ACTIONS.VIEW_ORDERS_PENDING);
  const canViewDebtsTotal = await canViewDashboardStat(ACTIONS.VIEW_DEBTS_TOTAL);

  // Charger données selon permissions
  const todayData = canViewRevenueToday || canViewSalesCount 
    ? await getTodayStats(objectId) 
    : { salesCount: 0, totalRevenue: 0 };
  
  const monthRevenue = canViewRevenueMonth 
    ? await getMonthRevenue(objectId) 
    : { totalRevenue: 0 };
  
  const previousMonthRevenue = canViewRevenuePreviousMonth 
    ? await getPreviousMonthRevenue(objectId) 
    : { totalRevenue: 0 };
  
  const yearRevenue = canViewRevenueYear 
    ? await getYearRevenue(objectId) 
    : { totalRevenue: 0 };
  
  const stockAlerts = canViewStockAlerts 
    ? await getStockAlerts(objectId) 
    : { outOfStockCount: 0, soonCount: 0 };
  
  const ordersToReceive = canViewOrdersPending 
    ? await countOrdersToReceive(objectId) 
    : 0;
  
  const debts = canViewDebtsTotal 
    ? await getTotalDebts(objectId) 
    : 0;

  // ✅ Définir les stats avec leurs permissions requises
  const stats = [
    {
      id: 'revenue-today',
      show: canViewRevenueToday,
      component: (
        <StatItem
          icon={BanknoteArrowUp}
          label="Chiffre d'affaires du jour"
          value={todayData.totalRevenue}
          currency
        />
      )
    },
    {
      id: 'revenue-month',
      show: canViewRevenueMonth,
      component: (
        <StatItem
          icon={TrendingUp}
          label="Chiffre d'affaires de ce mois"
          value={monthRevenue.totalRevenue}
          currency
        />
      )
    },
    {
      id: 'revenue-previous-month',
      show: canViewRevenuePreviousMonth,
      component: (
        <StatItem
          icon={() => (
            <div className="flex items-center gap-1">
              <Calendar className="w-5 h-5 text-[#004871]" />
              <ChevronLeft className="w-4 h-4 text-[#004871]" />
            </div>
          )}
          label="Chiffre d'affaires mois dernier"
          value={previousMonthRevenue.totalRevenue}
          currency
        />
      )
    },
    {
      id: 'revenue-year',
      show: canViewRevenueYear,
      component: (
        <StatItem
          icon={Calendar}
          label="Chiffre d'affaires de l'année"
          value={yearRevenue.totalRevenue}
          currency
        />
      )
    },
    {
      id: 'sales-count',
      show: canViewSalesCount,
      component: (
        <StatItem
          icon={ShoppingCart}
          label="Nombre de ventes du jour"
          value={todayData.salesCount}
        />
      )
    },
    {
      id: 'stock-alerts',
      show: canViewStockAlerts,
      component: (
        <StatItem
          icon={Package}
          label="Alertes stock"
          href={`/shop/${businessId}/dashboard/article/stock`}
          linkAriaLabel="Accéder au stock"
          soonCount={stockAlerts.soonCount}
          outOfStockCount={stockAlerts.outOfStockCount}
        />
      )
    },
    {
      id: 'orders-to-receive',
      show: canViewOrdersPending,
      component: (
        <StatItem
          icon={Truck}
          label="Commandes à recevoir"
          value={ordersToReceive}
          href={`/shop/${businessId}/dashboard/commande/historique?status=confirmed%2Cpartially_received&page=1`}
          linkAriaLabel="Voir les commandes à recevoir"
        />
      )
    },
    {
      id: 'total-debts',
      show: canViewDebtsTotal,
      component: (
        <StatItem
          icon={BanknoteArrowDown}
          label="Total des dettes"
          value={debts}
          currency
          linkAriaLabel="Voir le total des dettes"
          href={`/shop/${businessId}/dashboard/vente/historique-vente?status=pending,partial`}
        />
      )
    },
  ];

  // ✅ Filtrer les stats visibles
  const visibleStats = stats.filter(stat => stat.show);

  // Si aucune stat visible
  if (visibleStats.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Aucune statistique disponible pour votre rôle.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {visibleStats.map(stat => (
        <div key={stat.id}>
          {stat.component}
        </div>
      ))}
    </div>
  );
};

export default StatItemWrapper;