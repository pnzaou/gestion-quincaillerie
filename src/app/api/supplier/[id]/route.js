import dbConnection from "@/lib/db";
import Supplier from "@/models/Supplier.model";
import { withAuthAndRole } from "@/utils/withAuthAndRole";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const PUT = withAuthAndRole(async (req, { params }) => {

})

export const DELETE = withAuthAndRole(async (req, { params }) => {
    try {
        await dbConnection()
        const { id } = await params

        if(!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                message: "Veuillez fournir un ID valide",
                success: false,
                error: true
            }, { status: 400 })
        }

        const deletedSupplier = await Supplier.findByIdAndDelete(id)

        if(!deletedSupplier) {
            return NextResponse.json({
                message: "Aucun fournisseur trouvé pour cet ID.",
                success: false,
                error: true
            }, { status: 404 })
        }

        return NextResponse.json({
            message: "Fournisseur supprimé avec succès",
            success: true,
            error: false,
        }, { status: 200 })

    } catch (error) {
        console.error("Erreur lors de la suppression du fournisseur: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})