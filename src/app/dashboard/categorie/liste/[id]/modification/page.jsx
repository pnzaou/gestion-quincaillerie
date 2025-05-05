import AjoutCatForm from "@/components/dashbord/forms/Ajout-cat-form";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";

const Page = async ({ params }) => {
    const { id } = await params
    const { cookie, host, protocol } = await preparingServerSideRequest()

    const res = await fetch(`${protocol}://${host}/api/category/${id}`, {
        headers: {
            Cookie: cookie,
        },
    })
    const cat = await res.json()

    console.log(cat)
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Catégories</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Modification d&apos;une catégorie
                </p>
            </div>
            <div className="flex w-full items-center justify-center p-6 md:p-2">
                <div className="w-full max-w-lg">
                    <AjoutCatForm initialData={cat.data}/>
                </div>
            </div>
        </div>
    );
}

export default Page;
