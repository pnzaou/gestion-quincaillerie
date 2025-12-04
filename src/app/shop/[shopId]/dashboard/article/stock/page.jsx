import ArticlesTableAdmin from "@/components/dashbord/Articles-table-admin";
import ExcelExportButton from "@/components/dashbord/ExcelExportButton";
import { Button } from "@/components/ui/button";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";
import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const Page = async ({ searchParams }) => {

  const { cookie, host, protocol } = await preparingServerSideRequest()

  const { page, search } = await searchParams
  const page1 = page || 1
  const search1 = search || ""

  const rep = await fetch(`${protocol}://${host}/api/product?page=${page1}&limit=10&search=${search1}`, {
    headers: {"Cookie": cookie}
  })

  const { data, currentPage, totalPages } = await rep.json()

  return (
    <div className="flow-root">
      <div className="mb-6 flex items-center">
        <div className="flex-1/2">
          <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
          <p className="mt-2 text-sm text-gray-500">
              Gestion des articles
          </p>
        </div>
        <div className="flex-1/2 flex justify-end gap-4">
          <div className="mb-4 mr-4 md:block">
            <div>
              <ExcelExportButton initUrl="/api/product/export-excel"/>
            </div>
          </div>
          <div>
            <Link href="/dashboard/article/ajouter" className="w-full">
              <Button className="hidden md:block bg-[#0084D1] text-white px-4 py-2 rounded hover:bg-[#0042d1] hover:cursor-pointer">
                Ajouter un article
              </Button>
              <Button className="md:hidden rounded-md border p-2 flex items-center justify-center gap-1 bg-[#0084D1] text-white hover:bg-[#0042d1] hover:cursor-pointer">
                  <PlusIcon className="w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <ArticlesTableAdmin initialArt={data} currentPage={currentPage} initialTotalPages={totalPages} search={search1} />
    </div>
  );
}

export default Page;
