import { getEffectivePermissions } from "@/lib/permissionOverrides"; 
import { withAuth } from "@/utils/withAuth";
import { NextResponse } from "next/server";
import dbConnection from "@/lib/db";

export const GET = withAuth(
  async (req, session) => {
    await dbConnection();
    
    const userId = session.user.id || session.user._id;
    const userRole = session.user.role;
    const businessId = session.user.business || null;

    const effectivePerms = await getEffectivePermissions(userId, userRole, businessId);

    return NextResponse.json({
      userId,
      userRole,
      businessId,
      effectivePermissions: effectivePerms
    });
  },
  { roles: ["admin", "gerant", "comptable"] }
);