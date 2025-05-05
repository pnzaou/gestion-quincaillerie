import AjoutArticleForm from "@/components/dashbord/forms/Ajout-article-form";
import dbConnection from "@/lib/db";
import Category from "@/models/Category.model";

const Page = async () => {
    await dbConnection()
    const catsFromDb = await Category.find({});

    const cats = catsFromDb.map(cat => ({
        _id: cat._id.toString(),
        nom: cat.nom,
        description: cat.description,
        createdAt: cat.createdAt?.toISOString() || null,
        updatedAt: cat.updatedAt?.toISOString() || null,
    }))
    
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Ajout d&apos;un articles
                </p>
            </div>
            <div className="flex w-full items-center justify-center p-6 md:p-2">
                <div className="w-full max-w-lg">
                    <AjoutArticleForm cats={cats}/>
                </div>
            </div>
        </div>
    );
}

export default Page;
