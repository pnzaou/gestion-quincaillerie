import ArticlesListVente from "@/components/dashbord/Articles-list-vente";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";

const Page = async ({ searchParams }) => {
    const { cookie, host, protocol } = await preparingServerSideRequest()

    const { page, search } = await searchParams
    const page1 = page || 1
    const search1 = search || ""

    const rep = await fetch(`${protocol}://${host}/api/product?page=${page1}&limit=8&search=${search1}`, {
        headers: {"Cookie": cookie}
    })

    const { data, currentPage, totalPages } = await rep.json()
  
    return (
        <div className="flow-root">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ventes</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Effectuer une vente
                </p>
            </div>

            <ArticlesListVente initialArt={data} currentPage={currentPage} initialTotalPages={totalPages} search={search1}/>
        </div>
    )
}

export default Page;