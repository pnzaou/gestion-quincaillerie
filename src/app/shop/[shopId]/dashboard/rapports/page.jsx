import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";
import ReportsListClient from "@/components/dashbord/Reports-list-client";

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

      <ReportsListClient
        initialReports={data}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        shopId={shopId}
      />
    </div>
  );
};

export default Page;