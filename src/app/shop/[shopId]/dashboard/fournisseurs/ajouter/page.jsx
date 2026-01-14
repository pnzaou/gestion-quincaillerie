import AjoutSupplierForm from '@/components/dashbord/forms/Ajout-supplier-form';

const Page = () => {
    return (
        <div className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Fournisseurs</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Ajout d&apos;un fournisseur
                </p>
            </div>
            <div className="flex w-full items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl">
                    <AjoutSupplierForm/>
                </div>
            </div>
        </div>
    );
}

export default Page;