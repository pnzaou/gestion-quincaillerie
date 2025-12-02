import { NextResponse } from "next/server";
import { withAuthAndRole } from "@/utils/withAuthAndRole";
import BusinessModel from "@/models/Business.model";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";

export const GET = withAuthAndRole(async (req) => {
  try {
    await dbConnection();
    const session = await getServerSession(authOptions);
    const { id: ownerId } = session?.user || {};
    
    const businesses = await BusinessModel.find({ owner: ownerId })
      .select("_id name")
      .sort({ name: 1 });

    return NextResponse.json(
      {
        businesses,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/business :", error);
    return NextResponse.json(
      {
        message: "Erreur lors de la récupération des boutiques.",
        success: false,
      },
      { status: 500 }
    );
  }
});