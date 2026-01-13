import dbConnection from "@/lib/db";
import Notification from "@/models/Notification.model";
import { withAuth } from "@/utils/withAuth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// ============================================
// DELETE - Supprimer une notification
// ============================================
export const DELETE = withAuth(
  async (req, context, session) => {
    await dbConnection();

    try {
      const { id } = await context.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            message: "ID de notification invalide",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const userId = session.user?.id || session.user?._id;

      // Vérifier que la notification appartient à l'utilisateur
      const notification = await Notification.findOne({
        _id: id,
        recipient: userId
      });

      if (!notification) {
        return NextResponse.json(
          {
            message: "Notification non trouvée",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      // Supprimer
      await Notification.deleteOne({ _id: id });

      return NextResponse.json(
        {
          message: "Notification supprimée",
          success: true,
          error: false,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur DELETE /api/notifications/[id]:", error);
      return NextResponse.json(
        {
          message: "Erreur lors de la suppression de la notification",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.NOTIFICATIONS,
    action: ACTIONS.DELETE,
  }
);