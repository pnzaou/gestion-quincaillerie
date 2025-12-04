import ResourceNotFound from "@/components/dashbord/Resource-not-found";

const NotFound = () => {
    const props = {
        message: "Les données de l'utilisateur sont inexistantes ou introuvables.",
        backUrl: "/utilisateur/liste"
    };
    
    return (
        <>
           <ResourceNotFound {...props}/> 
        </>
    );
}

export default NotFound;
