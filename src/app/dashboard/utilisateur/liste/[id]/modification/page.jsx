import AjoutUserForm from "@/components/dashbord/forms/Ajout-user-form";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";

const Page = async ({ params }) => {
    const { id } = await params;
    const { cookie, host, protocol } = await preparingServerSideRequest()

    const response = await fetch(`${protocol}://${host}/api/user/${id}`, {
        headers: {
            "Cookie": cookie
        },
    })
    const data = await response.json();

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Utilisateurs</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Modifier de l'utilisateur
                </p>
            </div>
            <div className="flex w-full items-center justify-center p-6 md:p-2">
                <div className="w-full max-w-lg">
                    <AjoutUserForm initialData={data.data}/>
                </div>
            </div>
        </div>
    );
}

export default Page;
