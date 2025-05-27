import AjoutArticleForm from "@/components/dashbord/forms/Ajout-article-form";
import dbConnection from "@/lib/db";
import Category from "@/models/Category.model";
import Product from "@/models/Product.model";
import Supplier from "@/models/Supplier.model";

const Page = async ({ params }) => {
    const { id } = await params;

    await dbConnection()

    const [article, catsFromDb, foursFromDb] = await Promise.all([
        Product.findById(id).lean(),
        Category.find({},{nom: 1}).lean(),
        Supplier.find({},{nom: 1}).lean()
    ])

    const cats = catsFromDb.map(cat => ({
        _id: cat._id.toString(),
        nom: cat.nom
    }))

    const fours = foursFromDb.map(four => ({
        _id: four._id.toString(),
        nom: four.nom
    }))

    const initialDate = {
        ...article,
        _id: article._id.toString(),
        category_id: article.category_id?.toString() || "",
        supplier_id: article.supplier_id?.toString() || ""
    }
    
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Modification d&apos;un article
                </p>
            </div>
            <div className="flex w-full items-center justify-center p-6 md:p-2">
                <div className="w-full max-w-lg">
                    <AjoutArticleForm cats={cats} fours={fours} initialData={initialDate}/>
                </div>
            </div>
        </div>
    );
}

export default Page;
