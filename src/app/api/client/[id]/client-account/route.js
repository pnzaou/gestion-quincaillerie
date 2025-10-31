import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import History from "@/models/History.model";
import { deposit } from "@/services/account.service";
import { withAuth } from "@/utils/withAuth";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const POST = withAuth(async (req, { params }) => {
    await dbConnection();
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    try {
        const session = await getServerSession(authOptions)
        const { name, id: userId } = session.user;

        const {id} = await params;
        if(!id || !mongoose.Types.ObjectId.isValid(id)){
            await mongoSession.abortTransaction();
            mongoSession.endSession();
            return NextResponse.json({ 
                message: "Veuillez fournir un ID valide", 
                success: false, 
                error: true 
            }, { status: 400 })
        }
        const { amount } = await req.json()

        const { account, transaction } = await deposit(id, amount, { mongoSession, description: "Dépôt initial" })
        
        await History.create([{
            user: userId,
            actions: "create",
            resource: "ClientAccount",
            resourceId: account._id,
            description: `${name} a créé le compte client ${account.accountNumber} avec un solde initial de ${amount}`
        }], { session: mongoSession })

        await mongoSession.commitTransaction();
        mongoSession.endSession();

        return NextResponse.json({
            message: "Dépôt initial effectué avec succès",
            success: true,
            error: false,
            data: {
                account,
                transaction
            }
        }, { status: 201 })
        
    } catch (error) {
        console.error("Erreur lors de la création du compte client: ", error)
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})

export const PUT = withAuth(async (req, { params }) => {
    await dbConnection();
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    try {
        const session = await getServerSession(authOptions)
        const { name, id: userId } = session.user;
        const {id} = await params;

        if(!id || !mongoose.Types.ObjectId.isValid(id)){
            await mongoSession.abortTransaction();
            mongoSession.endSession();
            return NextResponse.json({ 
                message: "Veuillez fournir un ID valide", 
                success: false, 
                error: true 
            }, { status: 400 })
        }

        const { amount, description } = await req.json()

        const { account, transaction } = await deposit(id, amount, { mongoSession, description })

        await History.create([{
            user: userId,
            actions: "update",
            resource: "ClientAccount",
            resourceId: account._id,
            description: `${name} a déposé ${amount} sur le compte client ${account.accountNumber}.`
        }], { session: mongoSession })

        await mongoSession.commitTransaction();
        mongoSession.endSession();

        return NextResponse.json({
            message: "Dépôt effectué avec succès",
            success: true,
            error: false,
            data: {
                account,
                transaction
            }
        }, { status: 200 })
        
    } catch (error) {
        console.error("Erreur lors du dépôt sur le compte client: ", error)
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})