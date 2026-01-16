import { NextResponse } from 'next/server';
import dbConnection from '@/lib/db';
import { generateReport } from '@/services/report.service';
import { getReportDates } from '@/helpers/report.helpers';
import Business from '@/models/Business.model';

export const maxDuration = 300; // 5 minutes max

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { message: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  console.log('🕐 [CRON] Génération rapports mensuels démarrée');

  try {
    await dbConnection();
    
    const businesses = await Business.find({ status: 'actif' }).lean();
    
    // Mois précédent
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const results = await Promise.allSettled(
      businesses.map(business =>
        generateReport({
          businessId: business._id,
          type: 'monthly',
          startDate: lastMonth,
          endDate: lastMonthEnd,
          userId: null,
          notes: 'Rapport mensuel généré automatiquement'
        })
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ [CRON] Rapports mensuels: ${succeeded} réussis, ${failed} échoués`);

    return NextResponse.json({
      success: true,
      message: `Rapports mensuels générés: ${succeeded} réussis, ${failed} échoués`,
      details: {
        total: businesses.length,
        succeeded,
        failed
      }
    });

  } catch (error) {
    console.error('❌ [CRON] Erreur rapports mensuels:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur génération rapports mensuels',
        error: error.message 
      },
      { status: 500 }
    );
  }
}