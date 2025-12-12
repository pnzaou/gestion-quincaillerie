import ClientTable from "@/components/dashbord/Client-table"
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest"

const Page = async ({ searchParams, params }) => {
  const { shopId } = await params;
  const { cookie, host, protocol } = await preparingServerSideRequest()

  const { page, search } = await searchParams
  const page1 = page || 1
  const search1 = search || ""

  // ✅ Ajouter businessId à la requête
  const rep = await fetch(
    `${protocol}://${host}/api/client?page=${page1}&limit=5&search=${search1}&businessId=${shopId}`,
    {
      headers: { 'Cookie': cookie }
    }
  )
  const { data, totalPages, currentPage } = await rep.json()

  return (
    <div className="flow-root">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
        <p className="mt-2 text-sm text-gray-500">
          Gestion des clients
        </p>
      </div>

      <ClientTable
        initialClient={data}
        initialTotalPages={totalPages}
        currentPage={currentPage}
        search={search1}
      />
    </div>
  )
}

export default Page;