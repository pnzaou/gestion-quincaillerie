import dbConnection from "@/lib/db";
import Supplier from "@/models/Supplier.model";
import History from "@/models/History.model";
import { withAuthAndRole } from "@/utils/withAuthAndRole";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const PUT = withAuthAndRole(async (req, { params }) => {
    await dbConnection()
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
        const session = await getServerSession(authOptions)
        const { name, id: userId } = session.user

        const { id } = await params
        if(!id || !mongoose.Types.ObjectId.isValid(id)) {
            await mongoSession.abortTransaction()
            mongoSession.endSession()
            return NextResponse.json({
                message: "Veuillez fournir un ID valide",
                success: false,
                error: true
            }, { status: 400 })
        }
        
        const { nom, adresse, telephone, email } = await req.json()
        if(!nom.trim() || !telephone.trim()) {
            await mongoSession.abortTransaction()
            mongoSession.endSession()
            return NextResponse.json(
                {
                    message: "Veuillez renseigner le nom et le numéro de téléphone du fournisseur.",
                    success: false,
                    error: true
                },
                { status: 400 }
            )
        }

        const updatedSupplier = await Supplier.findByIdAndUpdate(
            id,
            { 
                nom: nom.trim(),
                adresse: adresse.trim(),
                telephone: telephone.trim(),
                email: email.trim()
            },
            { new: true, runValidators: true, session: mongoSession }
        )

        if (!updatedSupplier) {
            await mongoSession.abortTransaction()
            mongoSession.endSession()
            return NextResponse.json(
              { message: "Aucun fournisseur trouvé pour cet ID.", success: false, error: true },
              { status: 404 }
            );
        }

        // Création de l'historique
        await History.create([{
            user: userId,
            actions: "update",
            resource: "supplier",
            resourceId: id,
            description: `${name} a modifié le fournisseur ${updatedSupplier.nom}`,
            business: updatedSupplier.business
        }], { session: mongoSession })

        await mongoSession.commitTransaction()
        mongoSession.endSession()

        return NextResponse.json(
            { message: "Fournisseur mis à jour avec succès.", data: updatedSupplier, success: true, error: false  },
            { status: 200 }
        )

    } catch (error) {
        await mongoSession.abortTransaction()
        mongoSession.endSession()
        console.error("Erreur lors de la modification d'un fournisseur: ", error)

        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 }
        )
    }
})

export const DELETE = withAuthAndRole(async (req, { params }) => {
    await dbConnection()
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
        const session = await getServerSession(authOptions)
        const { name, id: userId } = session.user

        const { id } = await params

        if(!id || !mongoose.Types.ObjectId.isValid(id)) {
            await mongoSession.abortTransaction()
            mongoSession.endSession()
            return NextResponse.json({
                message: "Veuillez fournir un ID valide",
                success: false,
                error: true
            }, { status: 400 })
        }

        const deletedSupplier = await Supplier.findByIdAndDelete(id, { session: mongoSession })

        if(!deletedSupplier) {
            await mongoSession.abortTransaction()
            mongoSession.endSession()
            return NextResponse.json({
                message: "Aucun fournisseur trouvé pour cet ID.",
                success: false,
                error: true
            }, { status: 404 })
        }

        // Création de l'historique
        await History.create([{
            user: userId,
            actions: "delete",
            resource: "supplier",
            resourceId: id,
            description: `${name} a supprimé le fournisseur ${deletedSupplier.nom}`,
            business: deletedSupplier.business
        }], { session: mongoSession })

        await mongoSession.commitTransaction()
        mongoSession.endSession()

        return NextResponse.json({
            message: "Fournisseur supprimé avec succès",
            success: true,
            error: false,
        }, { status: 200 })

    } catch (error) {
        await mongoSession.abortTransaction()
        mongoSession.endSession()
        console.error("Erreur lors de la suppression du fournisseur: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})