import dbConnection from "@/lib/db";
import UserPermissionOverrides from "@/models/UserPermissionOverrides.model";
import { withAuth } from "@/utils/withAuth";
import { NextResponse } from "next/server";

// ============================================
// GET - Historique des modifications de permissions
// ============================================
export const GET = withAuth(
  async (req, session) => {
    try {
      await dbConnection();

      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");
      const search = searchParams.get("search") || "";
      const actionFilter = searchParams.get("action") || "all";
      const skip = (page - 1) * limit;

      // Construction de la requête
      const query = {};

      // Filtre par type d'action (grant/revoke/reset)
      // Note: Pour déterminer l'action, on analyse les overrides
      // - grant: addedPermissions existe
      // - revoke: removedPermissions existe
      // - reset: suppression (détecté via timestamps ou flag)

      // Pour l'instant, récupérer tous les overrides actifs et inactifs
      // (les inactifs = supprimés = reset)

      const [overrides, total] = await Promise.all([
        UserPermissionOverrides.find(query)
          .populate("user", "nom prenom email")
          .populate("createdBy", "nom prenom email")
          .populate("business", "name")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        UserPermissionOverrides.countDocuments(query),
      ]);

      // Transformer en format historique
      const history = overrides.map((override) => {
        // Déterminer l'action
        let action = "grant";
        const hasAdded = override.addedPermissions && Object.keys(override.addedPermissions).length > 0;
        const hasRemoved = override.removedPermissions && Object.keys(override.removedPermissions).length > 0;
        
        if (hasAdded && hasRemoved) {
          action = "mixed";
        } else if (hasRemoved) {
          action = "revoke";
        } else if (!hasAdded && !hasRemoved) {
          action = "reset";
        }

        // Si inactif et pas d'expiration, c'est un reset
        if (!override.isActive && !override.expiresAt) {
          action = "reset";
        }

        // Convertir les permissions en tableau
        const permissions = [];
        
        if (override.addedPermissions) {
          const addedMap = override.addedPermissions instanceof Map 
            ? Object.fromEntries(override.addedPermissions)
            : override.addedPermissions;
          
          for (const [resource, actions] of Object.entries(addedMap)) {
            actions.forEach(act => {
              permissions.push({ resource, action: act, type: 'grant' });
            });
          }
        }

        if (override.removedPermissions) {
          const removedMap = override.removedPermissions instanceof Map
            ? Object.fromEntries(override.removedPermissions)
            : override.removedPermissions;
          
          for (const [resource, actions] of Object.entries(removedMap)) {
            actions.forEach(act => {
              permissions.push({ resource, action: act, type: 'revoke' });
            });
          }
        }

        return {
          id: override._id.toString(),
          userId: override.user?._id.toString(),
          userName: override.user ? `${override.user.prenom} ${override.user.nom}` : "Utilisateur supprimé",
          userEmail: override.user?.email || "",
          adminId: override.createdBy?._id.toString(),
          adminName: override.createdBy ? `${override.createdBy.prenom} ${override.createdBy.nom}` : "Admin",
          action,
          permissions,
          reason: override.reason || "",
          expiresAt: override.expiresAt || null,
          isActive: override.isActive,
          businessId: override.business?._id.toString(),
          businessName: override.business?.name || "",
          createdAt: override.createdAt,
          updatedAt: override.updatedAt,
        };
      });

      // Filtrage post-traitement
      let filteredHistory = history;

      // Filtre recherche
      if (search) {
        const searchLower = search.toLowerCase();
        filteredHistory = filteredHistory.filter(
          (h) =>
            h.userName.toLowerCase().includes(searchLower) ||
            h.adminName.toLowerCase().includes(searchLower) ||
            h.reason.toLowerCase().includes(searchLower)
        );
      }

      // Filtre action
      if (actionFilter !== "all") {
        filteredHistory = filteredHistory.filter((h) => h.action === actionFilter);
      }

      return NextResponse.json(
        {
          message: "Historique récupéré avec succès.",
          success: true,
          error: false,
          data: filteredHistory,
          total: filteredHistory.length, // Total après filtrage
          currentPage: page,
          totalPages: Math.ceil(filteredHistory.length / limit),
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      console.error("Erreur GET /api/permission-overrides/history:", error);
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
    roles: ["admin"], // Admin uniquement
  }
);