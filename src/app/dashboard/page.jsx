import { countOrdersToReceive, getMonthRevenue, getStockAlerts, getTodayStats } from "@/lib/dashboardData";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest"

const Page = async () => {
    const {salesCount: salesCountMonth, totalRevenue: totalRevenueMonth} = await getMonthRevenue()
    const { salesCount, totalRevenue } = await getTodayStats()
    const { outOfStockCount, soonCount } = await getStockAlerts()
    const ordersToReceiveCount = await countOrdersToReceive()
    
    return (
        <div>
            <div className="mb-4">
                <h1 className="text-2xl font-semibold text-black/80">
                    Tableau de bord
                </h1>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                mois: {totalRevenueMonth}
                <br/>
                nbr ventes du jour: {salesCount}
                <br/>
                chiffre d'affaires du jour: {totalRevenue}
                <br/>
                rupture: {outOfStockCount}
                <br/>
                alerte: {soonCount}
                <br/>
                commandes à recevoir: {ordersToReceiveCount}
            </div>
        </div>
    );
}

export default Page;
