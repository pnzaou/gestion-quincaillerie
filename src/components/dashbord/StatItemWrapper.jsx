import { countOrdersToReceive, getMonthRevenue, getYearRevenue, getStockAlerts, getTodayStats, getPreviousMonthRevenue, getTotalDebts } from "@/lib/dashboardData";
import { TrendingUp, Calendar, ChevronLeft, ShoppingCart, Truck, ArrowUpRight, Package, BanknoteArrowUp, BanknoteArrowDown } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import mongoose from "mongoose";

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
  
  const { salesCount, totalRevenue } = await getTodayStats(objectId);
  const { totalRevenue: totalMonthRevenue } = await getMonthRevenue(objectId);
  const { totalRevenue: totalPreviousMonthRevenue } = await getPreviousMonthRevenue(objectId);
  const { totalRevenue: totalYearRevenue } = await getYearRevenue(objectId);
  const { outOfStockCount, soonCount } = await getStockAlerts(objectId);
  const ordersToReceiveCount = await countOrdersToReceive(objectId);
  const totalDebts = await getTotalDebts(objectId);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatItem
        icon={BanknoteArrowUp}
        label="Chiffre d'affaires du jour"
        value={totalRevenue}
        currency
      />
      <StatItem
        icon={TrendingUp}
        label="Chiffre d'affaires de ce mois"
        value={totalMonthRevenue}
        currency
      />
      <StatItem
        icon={() => (
          <div className="flex items-center gap-1">
            <Calendar className="w-5 h-5 text-[#004871]" />
            <ChevronLeft className="w-4 h-4 text-[#004871]" />
          </div>
        )}
        label="Chiffre d'affaires mois dernier"
        value={totalPreviousMonthRevenue}
        currency
      />
      <StatItem
        icon={Calendar}
        label="Chiffre d'affaires de l'année"
        value={totalYearRevenue}
        currency
      />
      <StatItem
        icon={ShoppingCart}
        label="Nombre de ventes du jour"
        value={salesCount}
      />
      <StatItem
        icon={Package}
        label="Alertes stock"
        href="/produits/rupture"
        linkAriaLabel="Accéder au stock"
        soonCount={soonCount}
        outOfStockCount={outOfStockCount}
      />
      <StatItem
        icon={Truck}
        label="Commandes à recevoir"
        value={ordersToReceiveCount}
        href={`/shop/${businessId}/dashboard/commande/historique?status=confirmed%2Cpartially_received&page=1`}
        linkAriaLabel="Voir les commandes à recevoir"
      />
      <StatItem
        icon={BanknoteArrowDown}
        label="Total des dettes"
        value={totalDebts}
        currency
        linkAriaLabel="Voir le total des dettes"
        href={`/shop/${businessId}/dashboard/vente/historique-vente?status=pending,partial`}
      />
    </div>
  );
};

export default StatItemWrapper;