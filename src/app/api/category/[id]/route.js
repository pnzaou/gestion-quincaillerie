import dbConnection from "@/lib/db"
import Category from "@/models/Category.model"
import mongoose from "mongoose"
import { NextResponse } from "next/server"
import Product from "@/models/Product.model"
import { withAuthAndRole } from "@/utils/withAuthAndRole"

export const GET = withAuthAndRole(async (req, {params}) => {
    try {
        await dbConnection()

        const {id} = await params
        if(!id || !mongoose.Types.ObjectId.isValid(id)){
            return NextResponse.json({ 
                message: "Veuillez fournir un ID valide", 
                success: false, 
                error: true 
            }, { status: 400 })
        }

        const cat = await Category.findById(id)
        if(!cat){
            return NextResponse.json({
                message: "Aucune catégorie trouvée pour cet ID",
                success: false,
                error: true
            },{ status: 404 })
        }

        return NextResponse.json({
            message: "Catégorie récupérée avec succès.",
            data: cat,
            success: true,
            error: false
        },{ status: 200, headers: { "Cache-Control": "no-store" } })

    } catch (error) {
        console.error("Erreur lors de la récupération de la catégorie: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})

export const PUT = withAuthAndRole(async (req, {params}) => {
    try {
        await dbConnection()

        const { id } = await params
        if(!id || !mongoose.Types.ObjectId.isValid(id)){
            return NextResponse.json({ 
                message: "Veuillez fournir un ID valide", 
                success: false, 
                error: true 
            }, { status: 400 })
        }

        const { nom, description } = await req.json()

        if (!nom && !description) {
            return NextResponse.json(
              { message: "Aucune donnée fournie pour la mise à jour.", success: false, error: true },
              { status: 400 }
            );
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { nom, description },
            { new: true, runValidators: true }
        )

        if (!updatedCategory) {
            return NextResponse.json(
              { message: "Aucune catégorie trouvée pour cet ID.", success: false, error: true },
              { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Catégorie mise à jour avec succès.", data: updatedCategory, success: true },
            { status: 200 }
        )
        
    } catch (error) {
        console.error("Erreur lors de la modification de la catégorie: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})

export const DELETE = withAuthAndRole(async (req, { params }) => {
    let session
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        await dbConnection()
        const { id } = await params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
              { message: "Veuillez fournir un ID valide.", success: false, error: true },
              { status: 400 }
            );
        }

        const deletedCategory = await Category.findByIdAndDelete(id, { session });


        if (!deletedCategory) {
            return NextResponse.json(
              { message: "Aucune catégorie trouvée pour cet ID.", success: false, error: true },
              { status: 404 }
            );
        }

        await Product.deleteMany({ category_id: id }, { session });

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json(
            { message: "Catégorie supprimée avec succès.", success: true, error: false },
            { status: 200 }
        )

    } catch (error) {
        if(session){
            await session.abortTransaction();
            session.endSession();
        }
        console.error("Erreur lors de la suppression de la catégorie: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})