import authOptions from "@/lib/auth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export const adminAndComptaAccess = (handler) => {
    return async (...args) => {
        const [req, context] = args

        const session = await getServerSession(authOptions)

        if(!session || (session.user.role !== "admin" && session.user.role !== "comptable")) {
            return NextResponse.json(
                {
                    message: "Accès refusé !",
                    success: false,
                    error: true
            },{ status: 401 })
        }

        if(args.length === 1) {
            return handler(req, session)
        } else {
            return handler(req, context, session)
        }
    }
}