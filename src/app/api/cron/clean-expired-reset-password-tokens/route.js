import dbConnection from "@/lib/db"
import PasswordResetToken from "@/models/PasswordResetToken.model"
import { NextResponse } from "next/server"

export async function GET(request) {
  // ✅ Protection CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnection() 
    const res = await PasswordResetToken.deleteMany({
      expiresAt: { $lt: Date.now() }
    })

    console.log(`✅ [CRON] Nettoyage tokens: ${res.deletedCount} supprimés`);

    return NextResponse.json({
      success: true,
      message: `Nettoyage terminé. ${res.deletedCount} tokens supprimés.`
    }, { status: 200 })
  } catch (error) {
    console.error("❌ [CRON] Erreur nettoyage tokens:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 }) 
  }
}