import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission, hasAnyPermission } from "@/lib/permissions";
import { hasPermissionWithOverrides } from "@/lib/permissionOverrides";

/**
 * Middleware d'authentification et d'autorisation unifié avec support des overrides
 * 
 * @param {Function} handler - Handler de la route
 * @param {Object} options - Options de configuration
 * @param {string} options.resource - Ressource concernée (ex: 'products')
 * @param {string|string[]} options.action - Action(s) requise(s) (ex: 'create' ou ['create', 'update'])
 * @param {boolean} options.requireAny - Si true, l'utilisateur doit avoir AU MOINS UNE des actions (défaut: false = toutes requises)
 * @param {string[]} options.roles - Rôles autorisés (optionnel, utilise les permissions si non fourni)
 * @param {boolean} options.checkOverrides - Vérifier les overrides en BD (défaut: true)
 * 
 * @example
 * // Vérifier permission avec overrides
 * export const POST = withAuth(handler, { 
 *   resource: RESOURCES.PRODUCTS, 
 *   action: ACTIONS.CREATE 
 * });
 */
export const withAuth = (handler, options = {}) => {
  return async (...args) => {
    const [req, context] = args;

    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          message: "Non authentifié. Veuillez vous connecter.",
          success: false,
          error: true,
        },
        { status: 401 }
      );
    }

    const userId = session.user?.id || session.user?._id;
    const userRole = session.user?.role;

    // 2. Vérification des rôles (ancien système, pour compatibilité)
    if (options.roles && options.roles.length > 0) {
      if (!options.roles.includes(userRole)) {
        return NextResponse.json(
          {
            message: "Accès refusé. Permissions insuffisantes.",
            success: false,
            error: true,
          },
          { status: 403 }
        );
      }
    }

    // 3. Vérification des permissions (nouveau système)
    if (options.resource && options.action) {
      const actions = Array.isArray(options.action) ? options.action : [options.action];
      
      // Par défaut, on vérifie les overrides (peut être désactivé avec checkOverrides: false)
      const shouldCheckOverrides = options.checkOverrides !== false;
      
      let authorized = false;

      if (shouldCheckOverrides && userId) {
        // Extraire businessId de la requête si disponible
        let businessId = null;
        
        try {
          // Tenter de récupérer businessId depuis le body
          const bodyClone = req.clone();
          const body = await bodyClone.json().catch(() => null);
          businessId = body?.businessId;
        } catch (e) {
          // Ignorer erreur
        }

        // Si pas dans body, essayer dans searchParams
        if (!businessId) {
          const { searchParams } = new URL(req.url);
          businessId = searchParams.get("businessId");
        }

        // Si pas dans params, essayer dans context.params
        if (!businessId && context?.params) {
          const params = await context.params;
          businessId = params?.shopId || params?.businessId;
        }

        if (businessId) {
          // Vérifier avec overrides (appel DB)
          if (options.requireAny) {
            // L'utilisateur doit avoir AU MOINS UNE des permissions
            for (const action of actions) {
              const hasAccess = await hasPermissionWithOverrides(userId, userRole, businessId, options.resource, action);
              if (hasAccess) {
                authorized = true;
                break;
              }
            }
          } else {
            // L'utilisateur doit avoir TOUTES les permissions
            authorized = true;
            for (const action of actions) {
              const hasAccess = await hasPermissionWithOverrides(userId, userRole, businessId, options.resource, action);
              if (!hasAccess) {
                authorized = false;
                break;
              }
            }
          }
        } else {
          // Pas de businessId trouvé, fallback sur vérification simple (sans overrides)
          console.warn("businessId non trouvé pour vérification overrides, fallback sur permissions hardcodées");
          if (options.requireAny) {
            authorized = hasAnyPermission(userRole, options.resource, actions);
          } else {
            authorized = actions.every(action => hasPermission(userRole, options.resource, action));
          }
        }
      } else {
        // Vérification simple (sans overrides)
        if (options.requireAny) {
          authorized = hasAnyPermission(userRole, options.resource, actions);
        } else {
          authorized = actions.every(action => hasPermission(userRole, options.resource, action));
        }
      }

      if (!authorized) {
        return NextResponse.json(
          {
            message: "Accès refusé. Permissions insuffisantes.",
            success: false,
            error: true,
            requiredPermissions: {
              resource: options.resource,
              actions: actions,
              requireAll: !options.requireAny
            }
          },
          { status: 403 }
        );
      }
    }

    // 4. Appeler le handler avec la session
    // ✅ FIX : Vérifier si context a des params pour déterminer le type de route
    if (context && context.params) {
      // Routes avec params dynamiques ([id], [shopId], etc.)
      return handler(req, context, session);
    } else {
      // Routes simples (GET, POST sans params)
      return handler(req, session);
    }
  };
};

/**
 * Alias pour compatibilité avec ancien code
 * @deprecated Utiliser withAuth({ roles: ['admin'] }) à la place
 */
export const withAuthAndRole = (handler) => {
  return withAuth(handler, { roles: ['admin'] });
};