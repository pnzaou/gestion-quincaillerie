import { getTopProducts } from "@/lib/dashboardData";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
const { withAuth } = require("@/utils/withAuth")

export const GET = withAuth(async (req) => {
    try {
        const url = new URL(req.url);
        const start = url.searchParams.get("start") ? new Date(url.searchParams.get("start")) : new Date(0);
        const end = url.searchParams.get("end") ? new Date(url.searchParams.get("end")) : new Date();
        const limit = Number(url.searchParams.get("limit") || 10);
        const businessIdParam = url.searchParams.get("businessId");
        
        if (!businessIdParam) {
            return NextResponse.json({ error: "businessId requis" }, { status: 400 });
        }
        
        const businessId = new mongoose.Types.ObjectId(businessIdParam);

        const results = await getTopProducts(start, end, businessId, limit);
        return NextResponse.json(results);
    } catch (error) {
        console.error("API top-products error:", error);
        return NextResponse.json({ error: "Internal" }, { status: 500 });
    }
})