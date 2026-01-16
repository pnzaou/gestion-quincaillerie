import dbConnection from "@/lib/db";
import { withAuth } from "@/utils/withAuth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { validateGenerateReportPayload } from "@/dtos/report.dto";
import { generateReport } from "@/services/report.service";
import { HttpError } from "@/services/errors.service";
import { getReportDates } from "@/helpers/report.helpers";

// ============================================
// POST - Générer un rapport
// ============================================
export const POST = withAuth(
  async (req, session) => {
    await dbConnection();
    const raw = await req.json();

    if (!raw.businessId) {
      return NextResponse.json(
        {
          message: "ID de la boutique manquant.",
          success: false,
          error: true,
        },
        { status: 400 }
      );
    }

    const { valid, errors, payload } = validateGenerateReportPayload(raw);
    if (!valid) {
      return NextResponse.json(
        {
          message: "Données invalides",
          errors,
          success: false,
          error: true,
        },
        { status: 400 }
      );
    }

    try {
      // Calculer les dates selon le type
      const { startDate, endDate } = getReportDates(
        payload.type,
        payload.startDate,
        payload.endDate
      );

      const report = await generateReport({
        businessId: payload.businessId,
        type: payload.type,
        startDate,
        endDate,
        userId: session.user?.id,
        notes: payload.notes
      });

      return NextResponse.json(
        {
          message: "Rapport généré avec succès.",
          success: true,
          error: false,
          data: report,
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("Erreur route POST /report :", err);
      if (err instanceof HttpError || (err.status && err.message)) {
        return NextResponse.json(
          { message: err.message, success: false, error: true },
          { status: err.status || 400 }
        );
      }
      return NextResponse.json(
        { message: "Erreur! Veuillez réessayer.", success: false, error: true },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.REPORTS,
    action: ACTIONS.CREATE,
  }
);

// ============================================
// GET - Liste des rapports
// ============================================
export const GET = withAuth(
  async (req, session) => {
    await dbConnection();

    try {
      const { searchParams } = new URL(req.url);
      const businessId = searchParams.get("businessId");
      const type = searchParams.get("type");
      const status = searchParams.get("status");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");

      if (!businessId) {
        return NextResponse.json(
          { message: "businessId requis", success: false, error: true },
          { status: 400 }
        );
      }

      const query = { business: businessId };
      if (type) query.type = type;
      if (status) query.status = status;

      const Report = (await import("@/models/Report.model")).default;

      const [reports, total] = await Promise.all([
        Report.find(query)
          .populate("generatedBy", "nom prenom")
          .sort({ generatedAt: -1 })
          .limit(limit)
          .skip((page - 1) * limit)
          .lean(),
        Report.countDocuments(query)
      ]);

      return NextResponse.json({
        success: true,
        error: false,
        data: reports,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (error) {
      console.error("Erreur GET /report:", error);
      return NextResponse.json(
        { message: "Erreur récupération rapports", success: false, error: true },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.REPORTS,
    action: ACTIONS.LIST,
  }
);