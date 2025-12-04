import RevenueChart from "@/components/dashbord/RevenueChart";
import StatItemWrapper from "@/components/dashbord/StatItemWrapper";
import TopProducts from "@/components/dashbord/TopProducts";
import { ChartSkeleton, ProductListSkeleton, StatItemsSkeleton } from "@/components/skeletons";
import { getTopProducts, getYearlyMonthlyRevenue } from "@/lib/dashboardData";
import { Suspense } from "react";
import mongoose from "mongoose";

const Page = async ({ params }) => {
    const { shopId } = await params;
    const businessId = new mongoose.Types.ObjectId(shopId);
    
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

    const topProducts = await getTopProducts(startOfYear, endOfYear, businessId, 10);
    const yearly = await getYearlyMonthlyRevenue(businessId, now.getFullYear());
    const formatTopProducts = topProducts.map(p => {
      return {...p, _id: p._id.toString()}
    })
    
    return (
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-black/70">
            Tableau de bord
          </h1>
        </div>

        <Suspense fallback={<StatItemsSkeleton />}>
          <StatItemWrapper businessId={shopId} />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueChart initialData={yearly} shopId={shopId} />
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<ProductListSkeleton />}>
              <TopProducts initialData={formatTopProducts} shopId={shopId} />
            </Suspense>
          </div>
        </div>
      </div>
    );
}

export default Page;