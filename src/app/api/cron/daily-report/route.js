import { NextResponse } from 'next/server';
import dbConnection from '@/lib/db';
import { generateReport } from '@/services/report.service';
import { getReportDates } from '@/helpers/report.helpers';
import Business from '@/models/Business.model';

export const maxDuration = 300; // 5 minutes max

export async function GET(request) {
  // Vérifier le secret Vercel pour sécurité
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { message: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  console.log('🕐 [CRON] Génération rapports quotidiens démarrée');

  try {
    await dbConnection();
    
    const businesses = await Business.find({ status: 'actif' }).lean();
    const { startDate, endDate } = getReportDates('daily');

    const results = await Promise.allSettled(
      businesses.map(business =>
        generateReport({
          businessId: business._id,
          type: 'daily',
          startDate,
          endDate,
          userId: null, // Généré automatiquement
          notes: 'Rapport quotidien généré automatiquement'
        })
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ [CRON] Rapports quotidiens: ${succeeded} réussis, ${failed} échoués`);

    return NextResponse.json({
      success: true,
      message: `Rapports quotidiens générés: ${succeeded} réussis, ${failed} échoués`,
      details: {
        total: businesses.length,
        succeeded,
        failed
      }
    });

  } catch (error) {
    console.error('❌ [CRON] Erreur rapports quotidiens:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur génération rapports quotidiens',
        error: error.message 
      },
      { status: 500 }
    );
  }
}