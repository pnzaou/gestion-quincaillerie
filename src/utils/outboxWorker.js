import cron from 'node-cron';
import mongoose from 'mongoose';
import { resend } from '@/lib/resend';
import Outbox from '@/models/Outbox.model';
import AccountCreatedSuccessfully from '@/components/email/Acount-created-successfully';

async function processBatch() {
    await mongoose.connect(process.env.MONGODB_URI)

    const events = await Outbox.find({}).limit(20)
    for (const ev of events) {
        try {
            if (ev.type === 'welcome_email') {
                const { to, defaultPassword, loginLink, userFullName } = ev.payload
                await resend.emails.send({
                    from: "Support Quincallerie <onboarding@resend.dev>",
                    to,
                    subject: "Bienvenue sur StockIt",
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
            console.error(`Erreur envoi mail pour ${ev._id}`, error)
        }
    }

    await mongoose.disconnect()
}

cron.schedule('*/5 * * * *', async () => {
    console.log('⏱️ Traitement de la file d’attente...')
    await processBatch()
})