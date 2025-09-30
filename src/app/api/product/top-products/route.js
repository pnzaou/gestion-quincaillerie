import { getTopProducts } from "@/lib/dashboardData";
import { NextResponse } from "next/server";
const { withAuth } = require("@/utils/withAuth")

export const GET = withAuth(async (req) => {
    try {
        const url = new URL(req.url);
        const start = url.searchParams.get("start") ? new Date(url.searchParams.get("start")) : new Date(0);
        const end = url.searchParams.get("end") ? new Date(url.searchParams.get("end")) : new Date();
        const limit = Number(url.searchParams.get("limit") || 10);

        const results = await getTopProducts(start, end, limit);
        return NextResponse.json(results);
    } catch (error) {
        console.error("API top-products error:", err);
        return NextResponse.json({ error: "Internal" }, { status: 500 });
    }
})