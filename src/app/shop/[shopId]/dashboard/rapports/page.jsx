import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";
import ReportsListClient from "@/components/dashbord/Reports-list-client";
import { Suspense } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Page = async ({ searchParams, params }) => {
  const { shopId } = await params;
  const { cookie, host, protocol } = await preparingServerSideRequest();

  const { page, type, status } = await searchParams;
  const page1 = page || 1;
  const type1 = type || "";
  const status1 = status || "";

  const typeParam = type1 ? `&type=${type1}` : "";
  const statusParam = status1 ? `&status=${status1}` : "";
  
  const rep = await fetch(
    `${protocol}://${host}/api/report?page=${page1}&limit=20&businessId=${shopId}${typeParam}${statusParam}`,
    {
      headers: { Cookie: cookie },
    }
  );

  const { data, currentPage, totalPages, total } = await rep.json();

  return (
    <div className="flow-root px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rapports de gestion</h2>
        <p className="mt-2 text-sm text-gray-500">
          Analysez les performances de votre boutique
        </p>
      </div>

      <Suspense fallback={<ReportsListSkeleton />}>
        <ReportsListClient
          initialReports={data}
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          shopId={shopId}
        />
      </Suspense>
    </div>
  );
};

function ReportsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Filtres skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <div className="rounded-lg bg-gray-50 p-2">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Page;