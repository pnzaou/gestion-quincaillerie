import CategoryTable from "@/components/dashbord/Category-table"
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest"

const Page = async ({ searchParams, params }) => {
  const { shopId } = await params;
  const { cookie, host, protocol } = await preparingServerSideRequest()

  const { page, search } = await searchParams
  const page1 = page || 1
  const search1 = search || ""

  const rep = await fetch(`${protocol}://${host}/api/category?page=${page1}&limit=5&search=${search1}&businessId=${shopId}`,{
    headers:{ 'Cookie':cookie }
  })
  const { data, totalPages, currentPage } = await rep.json()
  
  return (
    <div className="flow-root">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Catégories</h2>
        <p className="mt-2 text-sm text-gray-500">
            Gestion des catégories
        </p>
      </div>

      <CategoryTable
       initialCat={data}
       initialTotalPages={totalPages}
       currentPage={currentPage}
       search={search1}
      />
    </div>
  )
}

export default Page