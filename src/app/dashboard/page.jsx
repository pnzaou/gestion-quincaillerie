import { getMonthRevenue, getStockAlerts, getTodayStats } from "@/lib/dashboardData";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest"

const Page = async () => {
    const monthRevenue = await getMonthRevenue()
    const { salesCount, totalRevenue } = await getTodayStats()
    const { outOfStockCount, soonCount } = await getStockAlerts()
    
    return (
        <div>
            <div className="mb-4">
                <h1 className="text-2xl font-semibold text-black/80">
                    Tableau de bord
                </h1>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                mois: {monthRevenue}
                ventes: {salesCount}
                jour: {totalRevenue}
                rupture: {outOfStockCount}
                alerte: {soonCount}
            </div>
        </div>
    );
}

export default Page;
