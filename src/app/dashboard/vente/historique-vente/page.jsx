import SaleTable from "@/components/dashbord/Sale-table";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";


const Page = async ({ searchParams }) => {

    const { cookie, host, protocol } = await preparingServerSideRequest()

    const { page, search, status } = await searchParams
    const page1 = page || 1
    const search1 = search || ""
    const status1 = status || ""

    const statusParam = status1 ? `&status=${status1}` : ""

    const rep = await fetch(`${protocol}://${host}/api/sale?page=${page1}&limit=10&search=${search1}${statusParam}`, {
        headers: { 'Cookie': cookie }
    })
    
    const { data, totalPages, currentPage } = await rep.json()

    // Convertir status en tableau pour le composant
    const initialStatus = status1 ? status1.split(',').map(s => s.trim()).filter(Boolean) : []
    return (
        <div className="flow-root">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestion des Ventes</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Consultez et gérez toutes vos transactions
                </p>
            </div>

            <SaleTable
              initialSales={data}
              initialTotalPages={totalPages}
              currentPage={currentPage}
              search={search1}
              initialStatus={initialStatus}
            />
        </div>
    );
}

export default Page;
