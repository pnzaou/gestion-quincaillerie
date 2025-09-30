import { getYearlyMonthlyRevenue } from "@/lib/dashboardData";

const { withAuth } = require("@/utils/withAuth");
const { NextResponse } = require("next/server");

export const GET = withAuth(async (req) => {
    try {
        const url = new URL(req.url);
        const yearParam = url.searchParams.get("year");
        const year = yearParam ? Number(yearParam) : new Date().getFullYear();

        const results = await getYearlyMonthlyRevenue(year);
        return NextResponse.json(results);
    } catch (error) {
        console.error("API yearly-revenue error:", error);
        return NextResponse.json({ error: "Internal" }, { status: 500 });
    }
});