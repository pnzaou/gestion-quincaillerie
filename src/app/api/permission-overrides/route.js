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

      // Validation userId
      if (!userId) {
        return NextResponse.json(
          {
            message: "userId est requis.",
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

      // Normaliser businessId (null, undefined, "undefined" → null)
      const normalizedBusinessId = (businessId && businessId !== "undefined" && businessId !== "null") 
        ? businessId 
        : null;

      // Validation businessId UNIQUEMENT pour les gérants
      if (user.role === "gerant" && !normalizedBusinessId) {
        return NextResponse.json(
          {
            message: "businessId est requis pour un gérant.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      // Préparer les données
      const overrideData = {
        user: userId,
        addedPermissions: addedPermissions || {},
        removedPermissions: removedPermissions || {},
        reason: reason || "",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: session.user.id || session.user._id,
        isActive: true,
      };

      // Ajouter businessId seulement si valide
      if (normalizedBusinessId) {
        overrideData.business = normalizedBusinessId;
      }

      // Query de recherche
      const query = { user: userId };
      if (normalizedBusinessId) {
        query.business = normalizedBusinessId;
      }

      // Créer ou mettre à jour l'override
      const override = await UserPermissionOverrides.findOneAndUpdate(
        query,
        overrideData,
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

      if (!userId) {
        return NextResponse.json(
          {
            message: "userId est requis.",
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

      // Normaliser businessId (null, undefined, "undefined" → null)
      const normalizedBusinessId = (businessId && businessId !== "undefined" && businessId !== "null") 
        ? businessId 
        : null;

      // Validation businessId UNIQUEMENT pour les gérants
      if (user.role === "gerant" && !normalizedBusinessId) {
        return NextResponse.json(
          {
            message: "businessId est requis pour un gérant.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      // Query de recherche
      const query = {
        user: userId,
        isActive: true,
      };

      if (normalizedBusinessId) {
        query.business = normalizedBusinessId;
      }

      const override = await UserPermissionOverrides.findOne(query).populate("user", "name email role");

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

      if (!userId) {
        return NextResponse.json(
          {
            message: "userId est requis.",
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

      // Normaliser businessId (null, undefined, "undefined" → null)
      const normalizedBusinessId = (businessId && businessId !== "undefined" && businessId !== "null") 
        ? businessId 
        : null;

      // Validation businessId UNIQUEMENT pour les gérants
      if (user.role === "gerant" && !normalizedBusinessId) {
        return NextResponse.json(
          {
            message: "businessId est requis pour un gérant.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      // Query de suppression
      const query = { user: userId };
      if (normalizedBusinessId) {
        query.business = normalizedBusinessId;
      }

      await UserPermissionOverrides.findOneAndDelete(query);

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