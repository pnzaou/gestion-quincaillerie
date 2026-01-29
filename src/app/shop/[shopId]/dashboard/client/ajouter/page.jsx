import AjoutClientForm from '@/components/dashbord/forms/Ajout-client-form';

const Page = () => {
    return (
        <div className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Ajout d&apos;un client
                </p>
            </div>
            <div className="flex w-full items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl">
                    <AjoutClientForm />
                </div>
            </div>
        </div>
    );
}

export default Page;