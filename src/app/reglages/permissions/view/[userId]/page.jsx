"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  Pencil,
  Check,
  X,
  Clock,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PermissionsViewSkeleton } from "@/components/skeleton/PermissionsViewSkeleton";
import { ROLE_PERMISSIONS, RESOURCES, ACTIONS } from "@/lib/permissions";

const allResources = Object.values(RESOURCES);
const allActions = Object.values(ACTIONS);

const resourceLabels = {
  [RESOURCES.DASHBOARD]: { label: 'Tableau de bord', icon: '📊' },
  [RESOURCES.PRODUCTS]: { label: 'Produits', icon: '📦' },
  [RESOURCES.CATEGORIES]: { label: 'Catégories', icon: '🏪' },
  [RESOURCES.CLIENTS]: { label: 'Clients', icon: '👥' },
  [RESOURCES.CLIENT_ACCOUNTS]: { label: 'Comptes clients', icon: '💰' },
  [RESOURCES.USERS]: { label: 'Utilisateurs', icon: '👤' },
  [RESOURCES.SALES]: { label: 'Ventes', icon: '💵' },
  [RESOURCES.ORDERS]: { label: 'Commandes', icon: '📋' },
  [RESOURCES.SUPPLIERS]: { label: 'Fournisseurs', icon: '🚚' },
  [RESOURCES.SETTINGS]: { label: 'Paramètres', icon: '⚙️' },
  [RESOURCES.REPORTS]: { label: 'Rapports', icon: '📈' },
  [RESOURCES.PAYMENTS]: { label: 'Paiements', icon: '💳' },
};

const actionLabels = {
  [ACTIONS.CREATE]: 'Créer',
  [ACTIONS.READ]: 'Lire',
  [ACTIONS.UPDATE]: 'Modifier',
  [ACTIONS.DELETE]: 'Supprimer',
  [ACTIONS.LIST]: 'Lister',
  [ACTIONS.EXPORT]: 'Exporter',
  [ACTIONS.IMPORT]: 'Importer',
  [ACTIONS.APPROVE]: 'Approuver',
  [ACTIONS.CANCEL]: 'Annuler',
  [ACTIONS.VALIDATE]: 'Valider',
};

const roleLabels = {
  admin: { label: 'Administrateur', color: 'bg-red-500/10 text-red-600 border-red-500/30' },
  gerant: { label: 'Gérant', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  comptable: { label: 'Comptable', color: 'bg-green-500/10 text-green-600 border-green-500/30' },
  vendeur: { label: 'Vendeur', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
};

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grantedOverrides, setGrantedOverrides] = useState([]);
  const [revokedOverrides, setRevokedOverrides] = useState([]);

  const basePermissions = useMemo(() => {
    if (!user || !user.role) return [];
    
    const rolePerms = ROLE_PERMISSIONS[user.role] || {};
    const permsArray = [];
    
    Object.entries(rolePerms).forEach(([resource, actions]) => {
      actions.forEach(action => {
        permsArray.push({ resource, action });
      });
    });
    
    return permsArray;
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch(`/api/user/${userId}`);
        const userData = await userRes.json();
        
        if (userData.success && userData.data) {
          const u = userData.data;
          setUser({
            id: u._id,
            firstName: u.prenom || '',
            lastName: u.nom || '',
            email: u.email,
            role: u.role,
            businessId: typeof u.business === 'object' ? u.business._id : u.business,
            businessName: typeof u.business === 'object' ? u.business.name : '',
            avatar: u.avatar || '',
          });

          const params = new URLSearchParams({ userId: u._id });
          const businessId = typeof u.business === 'object' ? u.business._id : u.business;
          if (businessId) {
            params.append('businessId', businessId);
          }

          const overrideRes = await fetch(`/api/permission-overrides?${params.toString()}`);
          const overrideData = await overrideRes.json();
          
          if (overrideData.data) {
            const { addedPermissions, removedPermissions, reason, expiresAt, createdAt } = overrideData.data;
            
            const granted = [];
            if (addedPermissions) {
              Object.entries(addedPermissions).forEach(([resource, actions]) => {
                actions.forEach(action => {
                  granted.push({
                    id: `grant-${resource}-${action}`,
                    type: 'grant',
                    permission: { resource, action },
                    reason: reason || '',
                    expiresAt,
                    createdAt,
                  });
                });
              });
            }
            
            const revoked = [];
            if (removedPermissions) {
              Object.entries(removedPermissions).forEach(([resource, actions]) => {
                actions.forEach(action => {
                  revoked.push({
                    id: `revoke-${resource}-${action}`,
                    type: 'revoke',
                    permission: { resource, action },
                    reason: reason || '',
                    expiresAt,
                    createdAt,
                  });
                });
              });
            }
            
            setGrantedOverrides(granted);
            setRevokedOverrides(revoked);
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const allOverrides = useMemo(() => [...grantedOverrides, ...revokedOverrides], [grantedOverrides, revokedOverrides]);
  
  const hasExpiredOverrides = useMemo(() => 
    allOverrides.some(o => o.expiresAt && new Date(o.expiresAt) < new Date()),
    [allOverrides]
  );

  const hasPermission = (resource, action) => {
    const isBase = basePermissions.some(p => p.resource === resource && p.action === action);
    const isGranted = grantedOverrides.some(o => o.permission.resource === resource && o.permission.action === action);
    const isRevoked = revokedOverrides.some(o => o.permission.resource === resource && o.permission.action === action);
    
    if (isRevoked) return false;
    if (isGranted) return true;
    return isBase;
  };

  if (loading) {
    return <PermissionsViewSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Utilisateur non trouvé</p>
        <Button onClick={() => router.push("/reglages/permissions")} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-5 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/reglages/permissions")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Permissions de l'utilisateur</h1>
            <p className="text-muted-foreground">
              Vue détaillée des accès
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/reglages/permissions/edit/${user.id}`)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Pencil className="h-4 w-4" />
          Modifier
        </Button>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="text-right space-y-2">
              <Badge className={roleLabels[user.role].color}>
                {roleLabels[user.role].label}
              </Badge>
              {user.businessName && (
                <p className="text-sm text-muted-foreground">
                  {user.businessName}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expired Warning */}
      {hasExpiredOverrides && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-600">Permissions expirées</p>
            <p className="text-sm text-muted-foreground">
              Certaines modifications de permissions ont expiré et ne sont plus actives.
            </p>
          </div>
        </div>
      )}

      {/* Effective Permissions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions effectives</CardTitle>
          <CardDescription>
            Toutes les permissions actuellement actives pour cet utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {allResources.map((resource) => {
              const permissions = allActions.map(action => {
                const hasPerm = hasPermission(resource, action);
                const isFromRole = basePermissions.some(p => p.resource === resource && p.action === action);
                const isGranted = grantedOverrides.some(o => o.permission.resource === resource && o.permission.action === action);
                const isRevoked = revokedOverrides.some(o => o.permission.resource === resource && o.permission.action === action);
                
                return {
                  action,
                  hasPermission: hasPerm,
                  isFromRole,
                  isGranted,
                  isRevoked,
                };
              });

              const hasAnyPermission = permissions.some(p => p.hasPermission);
              const hasAnyOverride = permissions.some(p => p.isGranted || p.isRevoked);

              if (!hasAnyPermission && !hasAnyOverride) return null;

              return (
                <div key={resource} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{resourceLabels[resource]?.icon}</span>
                    <span className="font-medium">{resourceLabels[resource]?.label}</span>
                    {hasAnyOverride && (
                      <Badge variant="outline" className="text-xs gap-1 bg-violet-50 text-violet-700 border-violet-200">
                        <Sparkles className="h-3 w-3" />
                        Personnalisé
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {permissions.map(({ action, hasPermission: hasPerm, isGranted, isRevoked }) => (
                      <div
                        key={action}
                        className={`
                          flex items-center gap-1.5 px-2 py-1.5 rounded text-sm font-medium transition-colors
                          ${hasPerm 
                            ? isGranted 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                            : isRevoked
                              ? 'bg-red-50 text-red-600 border border-red-200 line-through opacity-75'
                              : 'bg-gray-50 text-gray-400 border border-gray-200'
                          }
                        `}
                      >
                        {hasPerm ? (
                          <Check className="h-3 w-3 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 shrink-0" />
                        )}
                        <span className="truncate">{actionLabels[action]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Overrides Detail */}
      {allOverrides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Détail des modifications</CardTitle>
            <CardDescription>
              Historique des personnalisations de permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allOverrides.map((override) => {
              const isExpired = override.expiresAt && new Date(override.expiresAt) < new Date();
              
              return (
                <div
                  key={override.id}
                  className={`p-4 rounded-lg border ${
                    isExpired 
                      ? 'bg-muted/30 border-muted' 
                      : override.type === 'grant'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-amber-500/5 border-amber-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${
                          override.type === 'grant'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        } border`}>
                          {override.type === 'grant' ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Ajoutée
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Retirée
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline">
                          {resourceLabels[override.permission.resource]?.icon} {resourceLabels[override.permission.resource]?.label}: {actionLabels[override.permission.action]}
                        </Badge>
                        {isExpired && (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                            Expirée
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        📝 {override.reason}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground space-y-1 shrink-0">
                      {override.createdAt && (
                        <p>Créé le {format(new Date(override.createdAt), "d MMM yyyy", { locale: fr })}</p>
                      )}
                      {override.expiresAt && (
                        <p className="flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {isExpired ? 'Expiré' : 'Expire'} le {format(new Date(override.expiresAt), "d MMM yyyy", { locale: fr })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">Légende</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-50 border border-blue-200" />
              <span className="text-muted-foreground">Rôle par défaut</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200" />
              <span className="text-muted-foreground">Ajoutée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-50 border border-red-200" />
              <span className="text-muted-foreground">Retirée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200" />
              <span className="text-muted-foreground">Non autorisé</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;