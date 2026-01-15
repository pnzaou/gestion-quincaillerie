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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        Utilisateurs
                    </h2>
                    <p className="text-sm sm:text-base text-gray-500">
                        Modification de l&apos;utilisateur
                    </p>
                </div>
                <AjoutUserForm initialData={data}/>
            </div>
        </div>
    );
}

export default Page;