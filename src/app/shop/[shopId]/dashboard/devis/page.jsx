import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";
import QuotesListClient from "@/components/dashbord/Quotes-list-client";
import { Suspense } from "react";

const Page = async ({ searchParams, params }) => {
  const { shopId } = await params;
  const { cookie, host, protocol } = await preparingServerSideRequest();

  const { page, status } = await searchParams;
  const page1 = page || 1;
  const status1 = status || "";

  const statusParam = status1 ? `&status=${status1}` : "";
  
  const rep = await fetch(
    `${protocol}://${host}/api/quote?page=${page1}&limit=20&businessId=${shopId}${statusParam}`,
    {
      headers: { Cookie: cookie },
    }
  );

  const { data, currentPage, totalPages, total } = await rep.json();

  return (
    <div className="flow-root px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Devis</h2>
        <p className="mt-2 text-sm text-gray-500">
          Gérez vos devis et convertissez-les en ventes
        </p>
      </div>

      <Suspense fallback={<QuotesListSkeleton />}>
        <QuotesListClient
          initialQuotes={data}
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          shopId={shopId}
        />
      </Suspense>
    </div>
  );
};

function QuotesListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filtre skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg bg-gray-50 p-2">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded animate-pulse"></div>
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