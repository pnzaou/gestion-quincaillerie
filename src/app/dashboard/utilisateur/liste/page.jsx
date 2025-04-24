import UserTable from "@/components/dashbord/User-table";
import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest";


const Page = async () => {
    const { cookie, host, protocol } = await preparingServerSideRequest()
    const rep = await fetch(`${protocol}://${host}/api/user`,{
        method:'GET',
        headers:{
            'Cookie':cookie
        }
    })
    const data = await rep.json()
    
    return (
        <div className="flow-root">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Utilisateurs</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Gestion des utilisateurs
                </p>
            </div>
            <UserTable initialUsers={data.data} />
        </div>
    );
}

export default Page;
