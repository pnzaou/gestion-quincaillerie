import AccountCreatedSuccessfully from "@/components/email/Acount-created-successfully"
import dbConnection from "@/lib/db"
import { resend } from "@/lib/resend"
import Outbox from "@/models/Outbox.model"
import { NextResponse } from "next/server"

const RETRY_WINDOW_MS = 1000 * 60 * 60 * 24;

export const GET = async () => {
    try {
        await dbConnection()

        const events = await Outbox.find({ processed: false }).limit(20)
        for (const ev of events) {
            try {
                if (ev.type === 'welcome_email') {
                    const { to, defaultPassword, loginLink, userFullName } = ev.payload
                    await resend.emails.send({
                        from: 'Support Quincaillerie <onboarding@resend.dev>',
                        to,
                        subject: 'Bienvenue sur StockProx',
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
            } catch (mailError) {
                console.log(`Erreur envoi mail pour Outbox ${ev._id}:`, mailError)

                const ageMs = Date.now() - ev.createdAt.getTime()
                if (ageMs > RETRY_WINDOW_MS) {
                    ev.processed = true
                    ev.processedAt = new Date()
                    console.warn(`Dead‑letter pour Outbox ${ev._id} (âgé de ${Math.round(ageMs/3600000)} h)`)
                }
            } finally {
                await ev.save()
            }
        }

        return NextResponse.json(
            { message: `Traitement terminé. (${events.length} événement${events.length > 1 ? "s" : ""} traité${events.length > 1 ? "s" : ""}).`},
            { status: 200 }
        )
    } catch (error) {
        console.error("Erreur dans le traitement de la file d'attente :", error)
        return NextResponse.json(
          { message: "Erreur serveur lors du traitement Outbox."},
          { status: 500 }
        )
    }
}