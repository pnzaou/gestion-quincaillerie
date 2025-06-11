import AccountCreatedSuccessfully from "@/components/email/Acount-created-successfully"
import { resend } from "@/lib/resend"
import Outbox from "@/models/Outbox.model"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

export const GET = async () => {
    await mongoose.connect(process.env.MONGODB_URI)

    const events = await Outbox.find({ processed: false }).limit(20)
    for (const ev of events) {
        try {
            if (ev.type === 'welcome_email') {
                const { to, defaultPassword, loginLink, userFullName } = ev.payload
                await resend.emails.send({
                   from: 'Support Quincaillerie <onboarding@resend.dev>',
                    to,
                    subject: 'Bienvenue sur StockIt',
                    react: (
                        <AccountCreatedSuccessfully
                            defaultPassword={defaultPassword}
                            loginLink={loginLink}
                            userFullName={userFullName}
                        />
                    ) 
                })
            }

            ev.processed = true
            ev.processedAt = new Date()
            await ev.save()
        } catch (error) {
            console.log(`Erreur envoi mail pour ${ev._id}`, error)
        }
    }

    await mongoose.disconnect()

    return NextResponse.json({ message: 'Traitement terminé'}, { status: 200 })
}