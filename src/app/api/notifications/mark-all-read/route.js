import dbConnection from "@/lib/db";
import Notification from "@/models/Notification.model";
import { withAuth } from "@/utils/withAuth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";

// ============================================
// POST - Marquer toutes les notifications comme lues
// ============================================
export const POST = withAuth(
  async (req, session) => {
    await dbConnection();

    try {
      const userId = session.user?.id || session.user?._id;

      // Marquer toutes les notifications non-lues comme lues
      const result = await Notification.updateMany(
        {
          recipient: userId,
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        }
      );

      return NextResponse.json(
        {
          message: `${result.modifiedCount} notification(s) marquée(s) comme lue(s)`,
          success: true,
          error: false,
          data: {
            modifiedCount: result.modifiedCount
          }
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur POST /api/notifications/mark-all-read:", error);
      return NextResponse.json(
        {
          message: "Erreur lors de la mise à jour des notifications",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.NOTIFICATIONS,
    action: ACTIONS.UPDATE,
  }
);