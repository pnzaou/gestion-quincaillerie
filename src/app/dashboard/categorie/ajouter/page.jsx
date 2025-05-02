import AjoutCatForm from "@/components/dashbord/Ajout-cat-form";

const Page = () => {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Catégories</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Ajout d&apos;une catégorie
                </p>
            </div>
            <div className="flex w-full items-center justify-center p-6 md:p-2">
                <div className="w-full max-w-lg">
                    <AjoutCatForm/>
                </div>
            </div>
        </div>
    );
}

export default Page;
