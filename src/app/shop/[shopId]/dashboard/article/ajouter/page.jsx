import AjoutArticleForm from "@/components/dashbord/forms/Ajout-article-form";
import dbConnection from "@/lib/db";
import Category from "@/models/Category.model";
import Supplier from "@/models/Supplier.model";
import mongoose from "mongoose";

const Page = async ({ params }) => {
    const { shopId } = await params;
    await dbConnection();

    const businessObjectId = new mongoose.Types.ObjectId(shopId);

    const [catsFromDb, foursFromDb] = await Promise.all([
        Category.find({ business: businessObjectId }, { nom: 1 }).lean(),
        Supplier.find({ business: businessObjectId }, { nom: 1 }).lean()
    ]);

    const cats = catsFromDb.map(cat => ({
        _id: cat._id.toString(),
        nom: cat.nom
    }));

    const fours = foursFromDb.map(four => ({
        _id: four._id.toString(),
        nom: four.nom
    }));
    
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Ajout d&apos;un article
                </p>
            </div>
            <div className="flex w-full items-center justify-center p-6 md:p-2">
                <div className="w-full max-w-lg">
                    <AjoutArticleForm cats={cats} fours={fours}/>
                </div>
            </div>
        </div>
    );
}

export default Page;