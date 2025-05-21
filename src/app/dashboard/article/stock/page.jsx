import ArticlesTable from "@/components/dashbord/Articles-table";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";

const Page = async ({ searchParams }) => {

  const { cookie, host, protocol } = await preparingServerSideRequest()

  const { page, search } = await searchParams
  const page1 = page || 1
  const search1 = search || ""

  const rep = await fetch(`${protocol}://${host}/api/product?page=${page1}&limit=5&search=${search1}`, {
    headers: {"Cookie": cookie}
  })

  const { data, currentPage, totalPages } = await rep.json()

  console.log(data)

  return (
    <div className="flow-root">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
        <p className="mt-2 text-sm text-gray-500">
            Gestion des articles
        </p>
      </div>
      <ArticlesTable initialArt={data} currentPage={currentPage} initialTotalPages={totalPages} search={search1} />
    </div>
  );
}

export default Page;
