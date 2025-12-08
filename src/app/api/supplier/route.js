import dbConnection from "@/lib/db"
import Supplier from "@/models/Supplier.model"
import History from "@/models/History.model"
import { NextResponse } from "next/server"
import { withAuthAndRole } from "@/utils/withAuthAndRole"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import mongoose from "mongoose"

export const POST = withAuthAndRole(async (req) => {
    await dbConnection()
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
        const session = await getServerSession(authOptions)
        const { name, id: userId } = session.user

        const { nom, adresse, telephone, email, businessId } = await req.json()

        if (!businessId) {
            await mongoSession.abortTransaction()
            mongoSession.endSession()
            return NextResponse.json(
                {
                    message: "ID de la boutique manquant.",
                    success: false,
                    error: true
                },
                { status: 400 }
            )
        }

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

        const businessObjectId = new mongoose.Types.ObjectId(businessId)
        const nomNormalise = nom.trim().toLowerCase()
        const emailNormalise = email?.trim().toLowerCase()

        const existingSupplier = await Supplier.findOne({ 
            nom: nomNormalise,
            business: businessObjectId
        }).session(mongoSession)

        console.log(existingSupplier)
        
        if(existingSupplier) {
            await mongoSession.abortTransaction()
            mongoSession.endSession()
            return NextResponse.json(
                {
                    message: "Ce fournisseur existe déjà dans cette boutique.",
                    success: false,
                    error: true
                },
                { status: 400 }
            )
        }

        if(telephone.trim()) {
            const existingTelephone = await Supplier.findOne({ 
                telephone,
                business: businessObjectId
            }).session(mongoSession)
            
            if(existingTelephone) {
                await mongoSession.abortTransaction()
                mongoSession.endSession()
                return NextResponse.json(
                    {
                        message: "Ce numéro de téléphone est déjà utilisé dans cette boutique.",
                        success: false,
                        error: true
                    }, { status: 400 }
                )
            }
        }

        const data = {
            nom: nomNormalise,
            adresse,
            telephone: telephone.trim(),
            business: businessObjectId
        }

        if(emailNormalise) {
            const existingEmail = await Supplier.findOne({ 
                email: emailNormalise,
                business: businessObjectId
            }).session(mongoSession)
            
            if(existingEmail) {
                await mongoSession.abortTransaction()
                mongoSession.endSession()
                return NextResponse.json(
                    {
                        message: "Cet email est déjà utilisé dans cette boutique.",
                        success: false,
                        error: true
                    }, { status: 400 }
                )
            }
            data.email = emailNormalise
        }

        const [rep] = await Supplier.create([data], { session: mongoSession })

        // Création de l'historique
        await History.create([{
            user: userId,
            actions: "create",
            resource: "supplier",
            resourceId: rep._id,
            description: `${name} a créé le fournisseur ${rep.nom}`,
            business: businessObjectId
        }], { session: mongoSession })

        await mongoSession.commitTransaction()
        mongoSession.endSession()

        return NextResponse.json({
            message: "Fournisseur créé avec succès.",
            success: true,
            error: false,
            data: rep
        }, { status: 201 })

    } catch (error) {
        await mongoSession.abortTransaction()
        mongoSession.endSession()
        console.error("Erreur lors de la création d'un fournisseur: ", error)

        let errorMessage = "Erreur! Veuillez réessayer."

        if (error.code === 11000) {
            errorMessage = "Ce fournisseur existe déjà."
        }

        return NextResponse.json({
            message: errorMessage,
            success: false,
            error: true
        }, { status: 500 }
        )
    }
})

export const GET = withAuthAndRole(async (req) => {
    try {
        await dbConnection()

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "5")
        const search = searchParams.get("search") || ""
        const businessId = searchParams.get("businessId")
        const skip = (page - 1) * limit

        if (!businessId) {
            return NextResponse.json(
                {
                    message: "ID de la boutique manquant.",
                    success: false,
                    error: true
                },
                { status: 400 }
            )
        }

        const businessObjectId = new mongoose.Types.ObjectId(businessId)

        const query = {
            business: businessObjectId,
            ...(search && { nom: { $regex: search, $options: "i" } })
        }

        const [fournisseurs, total] = await Promise.all([
            Supplier.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
            Supplier.countDocuments(query)
        ])

        return NextResponse.json(
            { 
                message: fournisseurs.length === 0? "Aucun fournisseur enregistré." : "Fournisseurs récupérés avec succès.",
                data: fournisseurs,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                success: true,
                error: false
            },
            { status: 200, headers: { "Cache-Control": "no-store" } }
        )
    } catch (error) {
        console.error("Erreur lors de la récupération des fournisseurs: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        },{ status: 500 })
    }
})