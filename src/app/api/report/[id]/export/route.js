import { NextResponse } from 'next/server';
import dbConnection from '@/lib/db';
import { withAuth } from '@/utils/withAuth';
import { RESOURCES, ACTIONS } from '@/lib/permissions';
import Report from '@/models/Report.model';
import mongoose from 'mongoose';
import { generateReportPDF, getReportPDFBlob } from '@/services/report.pdf.service';
import { generateReportExcel, getReportExcelBuffer } from '@/services/report.excel.service';
import { generateReportCSV } from '@/services/report.csv.service';
import { generateExportFileName } from '@/helpers/report.helpers';

// ============================================
// GET /api/report/[id]/export?format=pdf|excel|csv
// ============================================
export const GET = withAuth(
  async (req, context, session) => {
    await dbConnection();

    try {
      const { id } = await context.params;
      const { searchParams } = new URL(req.url);
      const format = searchParams.get('format') || 'pdf';

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { message: 'ID de rapport invalide', success: false, error: true },
          { status: 400 }
        );
      }

      const report = await Report.findById(id)
        .populate('business', 'name')
        .populate('generatedBy', 'nom prenom')
        .populate('data.sales.topProducts.product', 'nom')
        .populate('data.clients.topClients.client', 'nomComplet')
        .lean();

      if (!report) {
        return NextResponse.json(
          { message: 'Rapport non trouvé', success: false, error: true },
          { status: 404 }
        );
      }

      const filename = generateExportFileName(report, format);

      // Export selon format
      switch (format) {
        case 'pdf': {
          const pdfDoc = await generateReportPDF(report);
          const pdfBuffer = pdfDoc.output('arraybuffer');
          
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}"`,
            },
          });
        }

        case 'excel': {
          const excelBuffer = await getReportExcelBuffer(report);
          
          return new NextResponse(excelBuffer, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment; filename="${filename}"`,
            },
          });
        }

        case 'csv': {
          const csvString = generateReportCSV(report);
          
          return new NextResponse(csvString, {
            headers: {
              'Content-Type': 'text/csv;charset=utf-8;',
              'Content-Disposition': `attachment; filename="${filename}"`,
            },
          });
        }

        default:
          return NextResponse.json(
            { 
              message: 'Format invalide. Formats acceptés: pdf, excel, csv',
              success: false,
              error: true 
            },
            { status: 400 }
          );
      }

    } catch (error) {
      console.error('Erreur export rapport:', error);
      return NextResponse.json(
        { 
          message: 'Erreur lors de l\'export du rapport',
          success: false,
          error: true 
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.REPORTS,
    action: ACTIONS.READ,
  }
);