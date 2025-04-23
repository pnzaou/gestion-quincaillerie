import AjoutUserForm from "@/components/dashbord/Ajout-user-form";

const Page = () => {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-2">
            <div className="w-full max-w-lg">
                <AjoutUserForm/>
            </div>
        </div>
    );
}

export default Page;
