import ArticlesTableAdmin from "@/components/dashbord/Articles-table-admin";
import ExcelExportButton from "@/components/dashbord/ExcelExportButton";
import { Button } from "@/components/ui/button";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";
import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const Page = async ({ searchParams, params }) => {
  const { shopId } = await params;
  const { cookie, host, protocol } = await preparingServerSideRequest();

  const { page, search } = await searchParams;
  const page1 = page || 1;
  const search1 = search || "";

  const rep = await fetch(
    `${protocol}://${host}/api/product?page=${page1}&limit=10&search=${search1}&businessId=${shopId}`,
    {
      headers: { Cookie: cookie }
    }
  );

  const { data, currentPage, totalPages } = await rep.json();

  return (
    <div className="flow-root">
      {/* Header amélioré */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
          <p className="mt-1 text-sm text-gray-500">Gestion des articles</p>
        </div>
        
        {/* Actions - responsive */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ExcelExportButton 
            initUrl={`/api/product/export-excel?businessId=${shopId}`} 
          />
          
          <Link href={`/shop/${shopId}/dashboard/article/ajouter`} className="flex-shrink-0">
            {/* Desktop button */}
            <Button className="hidden sm:flex bg-[#0084D1] text-white px-4 py-2 rounded hover:bg-[#0042d1] hover:cursor-pointer whitespace-nowrap">
              Ajouter un article
            </Button>
            {/* Mobile button */}
            <Button className="sm:hidden rounded-md p-2 flex items-center justify-center bg-[#0084D1] text-white hover:bg-[#0042d1] hover:cursor-pointer">
              <PlusIcon className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <ArticlesTableAdmin
        initialArt={data}
        currentPage={currentPage}
        initialTotalPages={totalPages}
        search={search1}
      />
    </div>
  );
};

export default Page;