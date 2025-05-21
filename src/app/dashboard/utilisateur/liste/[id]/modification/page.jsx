import AjoutUserForm from "@/components/dashbord/forms/Ajout-user-form";
import dbConnection from "@/lib/db";
import User from "@/models/User.model";
import mongoose from "mongoose";
import { notFound } from "next/navigation";

const Page = async ({ params }) => {
    const { id } = await params;
    await dbConnection();

    if(!id || !mongoose.Types.ObjectId.isValid(id)) {
        notFound()
        return;
    }

    const rep = await User.findById(id, { nom: 1, prenom: 1, email: 1, role: 1 }).lean();
    const data = {...rep, _id: rep._id.toString()}

    if (!data) {
        notFound()
        return;
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Utilisateurs</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Modification de l'utilisateur
                </p>
            </div>
            <div className="flex w-full items-center justify-center p-6 md:p-2">
                <div className="w-full max-w-lg">
                    <AjoutUserForm initialData={data}/>
                </div>
            </div>
        </div>
    );
}

export default Page;
