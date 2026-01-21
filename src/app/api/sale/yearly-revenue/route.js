import { getYearlyMonthlyRevenue } from "@/lib/dashboardData";
import { withAuth } from "@/utils/withAuth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req) => {
    try {
        const url = new URL(req.url);
        const yearParam = url.searchParams.get("year");
        const businessIdParam = url.searchParams.get("businessId");
        
        if (!businessIdParam) {
            return NextResponse.json({ error: "businessId requis" }, { status: 400 });
        }
        
        const year = yearParam ? Number(yearParam) : new Date().getFullYear();
        const businessId = new mongoose.Types.ObjectId(businessIdParam);

        const results = await getYearlyMonthlyRevenue(businessId, year);
        return NextResponse.json(results);
    } catch (error) {
        console.error("API yearly-revenue error:", error);
        return NextResponse.json({ error: "Internal" }, { status: 500 });
    }
});