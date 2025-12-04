import AjoutSupplierForm from "@/components/dashbord/forms/Ajout-supplier-form";
import dbConnection from "@/lib/db";
import Supplier from "@/models/Supplier.model";
import mongoose from "mongoose";
import { notFound } from "next/navigation";

const Page = async ({ params }) => {
    const { id } = await params
    await dbConnection()

    if(!id || !mongoose.Types.ObjectId.isValid(id)) {
        notFound()
        return;
    }

    const data = await Supplier.findById(id,).lean()
    const initialData = {...data, _id: data._id.toString()}

    if (!data) {
        notFound()
        return;
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Fournisseurs</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Modification d&apos;un fournisseur
                </p>
            </div>
            <div className="flex w-full items-center justify-center p-6 md:p-2">
                <div className="w-full max-w-lg">
                    <AjoutSupplierForm initialData={initialData}/>
                </div>
            </div>
        </div>
    );
}

export default Page;
