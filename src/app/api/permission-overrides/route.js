import dbConnection from "@/lib/db";
import { ACTIONS, RESOURCES } from "@/lib/permissions";
import User from "@/models/User.model";
import UserPermissionOverrides from "@/models/UserPermissionOverrides.model";
import { withAuth } from "@/utils/withAuth";
import { NextResponse } from "next/server";


// ============================================
// POST - Créer ou mettre à jour un override
// ============================================
export const POST = withAuth(
  async (req, session) => {
    try {
      await dbConnection();

      const {
        userId,
        businessId,
        addedPermissions,
        removedPermissions,
        reason,
        expiresAt,
      } = await req.json();

      // Validation
      if (!userId || !businessId) {
        return NextResponse.json(
          {
            message: "userId et businessId sont requis.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      // Vérifier que l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          {
            message: "Utilisateur introuvable.",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      // Vérifier qu'on ne modifie pas les permissions d'un admin (sécurité)
      if (user.role === "admin") {
        return NextResponse.json(
          {
            message: "Impossible de modifier les permissions d'un administrateur.",
            success: false,
            error: true,
          },
          { status: 403 }
        );
      }

      // Créer ou mettre à jour l'override
      const override = await UserPermissionOverrides.findOneAndUpdate(
        { user: userId, business: businessId },
        {
          user: userId,
          business: businessId,
          addedPermissions: addedPermissions || {},
          removedPermissions: removedPermissions || {},
          reason: reason || "",
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          createdBy: session.user.id || session.user._id,
          isActive: true,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

      return NextResponse.json(
        {
          message: "Permissions personnalisées enregistrées avec succès.",
          success: true,
          error: false,
          data: override,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur POST /api/permission-overrides:", error);
      return NextResponse.json(
        {
          message: error.message || "Erreur! Veuillez réessayer.",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    roles: ["admin"]
  }
);

// ============================================
// GET - Récupérer les overrides d'un utilisateur
// ============================================
export const GET = withAuth(
  async (req, session) => {
    try {
      await dbConnection();

      const { searchParams } = new URL(req.url);
      const userId = searchParams.get("userId");
      const businessId = searchParams.get("businessId");

      if (!userId || !businessId) {
        return NextResponse.json(
          {
            message: "userId et businessId sont requis.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const override = await UserPermissionOverrides.findOne({
        user: userId,
        business: businessId,
        isActive: true,
      }).populate("user", "name email role");

      if (!override) {
        return NextResponse.json(
          {
            message: "Aucune permission personnalisée trouvée.",
            success: true,
            error: false,
            data: null,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          message: "Permissions personnalisées récupérées.",
          success: true,
          error: false,
          data: override,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur GET /api/permission-overrides:", error);
      return NextResponse.json(
        {
          message: error.message || "Erreur! Veuillez réessayer.",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    roles: ["admin"]
  }
);

// ============================================
// DELETE - Supprimer les overrides d'un utilisateur
// ============================================
export const DELETE = withAuth(
  async (req, session) => {
    try {
      await dbConnection();

      const { searchParams } = new URL(req.url);
      const userId = searchParams.get("userId");
      const businessId = searchParams.get("businessId");

      if (!userId || !businessId) {
        return NextResponse.json(
          {
            message: "userId et businessId sont requis.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      await UserPermissionOverrides.findOneAndDelete({
        user: userId,
        business: businessId,
      });

      return NextResponse.json(
        {
          message: "Permissions personnalisées supprimées avec succès.",
          success: true,
          error: false,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur DELETE /api/permission-overrides:", error);
      return NextResponse.json(
        {
          message: error.message || "Erreur! Veuillez réessayer.",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    roles: ["admin"]
  }
);