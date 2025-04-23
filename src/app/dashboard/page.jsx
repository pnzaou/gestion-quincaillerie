import { preparingServerSideRequest } from "@/utils/preparingServerSideRequest"

const Page = async () => {
    // const { cookie, host, protocol } = await preparingServerSideRequest()
    // const rep = await fetch(`${protocol}://${host}/api/category`,{
    //     method:'GET',
    //     headers:{
    //         'Cookie':cookie
    //     }
    // })
    // const data = await rep.json()
    
    return (
        <div>
            dashboard
        </div>
    );
}

export default Page;
