import dbConnection from "@/lib/db";
import Notification from "@/models/Notification.model";
import { withAuth } from "@/utils/withAuth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";

// ============================================
// GET - Liste des notifications de l'utilisateur
// ============================================
export const GET = withAuth(
  async (req, session) => {
    await dbConnection();

    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get("limit") || "20");
      const unreadOnly = searchParams.get("unreadOnly") === "true";
      const type = searchParams.get("type"); // Filtrer par type (ex: "stock_out")

      const userId = session.user?.id || session.user?._id;

      // Construire query
      const query = { recipient: userId };
      
      if (unreadOnly) {
        query.isRead = false;
      }

      if (type) {
        query.type = type;
      }

      // Récupérer notifications
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 100)) // Max 100
        .lean();

      // Compter non-lues
      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isRead: false
      });

      return NextResponse.json(
        {
          success: true,
          error: false,
          data: notifications,
          unreadCount,
          total: notifications.length
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur GET /api/notifications:", error);
      return NextResponse.json(
        {
          message: "Erreur lors de la récupération des notifications",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.NOTIFICATIONS, // Notifications = dashboard
    action: ACTIONS.LIST,
  }
);