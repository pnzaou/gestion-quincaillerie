import AccountCreatedSuccessfully from "@/components/email/Acount-created-successfully"
import dbConnection from "@/lib/db"
import { resend } from "@/lib/resend"
import Outbox from "@/models/Outbox.model"
import { NextResponse } from "next/server"

const RETRY_WINDOW_MS = 1000 * 60 * 60 * 24; // 24h

export async function GET(request) {
  // ✅ Protection CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🕐 [CRON] Traitement emails de bienvenue démarré');

  try {
    await dbConnection()

    const events = await Outbox.find({ processed: false }).limit(20)
    
    let successCount = 0;
    let errorCount = 0;

    for (const ev of events) {
      try {
        if (ev.type === 'welcome_email') {
          const { to, defaultPassword, loginLink, userFullName } = ev.payload
          await resend.emails.send({
            from: 'Support StockProx <onboarding@resend.dev>',
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
          successCount++;
        }

        ev.processed = true
        ev.processedAt = new Date()
      } catch (mailError) {
        console.error(`❌ [CRON] Erreur mail Outbox ${ev._id}:`, mailError)
        errorCount++;

        const ageMs = Date.now() - ev.createdAt.getTime()
        if (ageMs > RETRY_WINDOW_MS) {
          ev.processed = true
          ev.processedAt = new Date()
          console.warn(`⚠️ Dead-letter Outbox ${ev._id} (âge: ${Math.round(ageMs/3600000)}h)`)
        }
      } finally {
        await ev.save()
      }
    }

    console.log(`✅ [CRON] Emails: ${successCount} envoyés, ${errorCount} échoués`);

    return NextResponse.json({
      success: true,
      message: `Traitement terminé: ${successCount} envoyés, ${errorCount} échoués`,
      details: {
        total: events.length,
        succeeded: successCount,
        failed: errorCount
      }
    }, { status: 200 })
  } catch (error) {
    console.error("❌ [CRON] Erreur traitement Outbox:", error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}