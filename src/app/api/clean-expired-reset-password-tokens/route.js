import dbConnection from "@/lib/db"
import PasswordResetToken from "@/models/PasswordResetToken.model"
import { NextResponse } from "next/server"

export const GET = async (req) => {
    try {
       await dbConnection() 
       const res = await PasswordResetToken.deleteMany({
        expiresAt: { $lt: Date.now() }
       })

       return NextResponse.json({
        message: `Nettoyage terminé. ${res.deletedCount} tokens supprimés.`,
        success: true,
        error: false
       }, { status: 200})
    } catch (error) {
        console.error("Erreur pendant le nettoyage des tokens expirés:", error)
        return NextResponse.json({ 
            message: "Erreur", 
            success: false,
            error: true 
        }, { status: 500 }) 
    }
}