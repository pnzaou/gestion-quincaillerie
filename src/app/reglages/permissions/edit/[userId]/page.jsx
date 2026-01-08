"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronLeft,
  AlertTriangle,
  Check,
  X,
  Calendar,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { PermissionsEditSkeleton } from "@/components/skeleton/PermissionsEditSkeleton";
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
  const isNewMode = userId === 'new';

  const [selectedUserId, setSelectedUserId] = useState(isNewMode ? null : userId || null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
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

  const [permissionsToGrant, setPermissionsToGrant] = useState([]);
  const [permissionsToRevoke, setPermissionsToRevoke] = useState([]);
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const availableUsers = useMemo(() => 
    users.filter(u => u.role !== 'admin'),
    [users]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (isNewMode) {
          const res = await fetch("/api/user?limit=100");
          const data = await res.json();
          const allUsers = (data.data || []).map(u => ({
            id: u._id,
            firstName: u.prenom || '',
            lastName: u.nom || '',
            email: u.email,
            role: u.role,
            businessId: typeof u.business === 'object' ? u.business._id : u.business,
            businessName: typeof u.business === 'object' ? u.business.name : '',
            avatar: u.avatar || '',
          }));
          
          setUsers(allUsers);
        } else {
          const userRes = await fetch(`/api/user/${userId}`);
          const userData = await userRes.json();
          
          if (userData.success && userData.data) {
            const u = userData.data;
            const foundUser = {
              id: u._id,
              firstName: u.prenom || '',
              lastName: u.nom || '',
              email: u.email,
              role: u.role,
              businessId: typeof u.business === 'object' ? u.business._id : u.business,
              businessName: typeof u.business === 'object' ? u.business.name : '',
              avatar: u.avatar || '',
            };
            
            setUser(foundUser);
            await loadOverrides(foundUser);
          } else {
            toast.error("Utilisateur introuvable");
            router.push("/reglages/permissions");
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, isNewMode, router]);

  const loadOverrides = async (userToLoad) => {
    try {
      // ✅ FIX: Ne pas envoyer businessId si undefined/null
      const params = new URLSearchParams({ userId: userToLoad.id });
      if (userToLoad.businessId) {
        params.append('businessId', userToLoad.businessId);
      }

      const res = await fetch(`/api/permission-overrides?${params.toString()}`);
      const data = await res.json();
      
      if (data.data) {
        const { addedPermissions, removedPermissions, reason: existingReason, expiresAt: existingExpiry } = data.data;
        
        const added = [];
        if (addedPermissions) {
          Object.entries(addedPermissions).forEach(([resource, actions]) => {
            actions.forEach(action => {
              added.push({ resource, action });
            });
          });
        }
        
        const removed = [];
        if (removedPermissions) {
          Object.entries(removedPermissions).forEach(([resource, actions]) => {
            actions.forEach(action => {
              removed.push({ resource, action });
            });
          });
        }
        
        setPermissionsToGrant(added);
        setPermissionsToRevoke(removed);
        setReason(existingReason || "");
        setExpiresAt(existingExpiry ? new Date(existingExpiry).toISOString().split('T')[0] : "");
      }
    } catch (error) {
      console.error("Erreur chargement overrides:", error);
    }
  };

  const hasBasePermission = (resource, action) => {
    return basePermissions.some(p => p.resource === resource && p.action === action);
  };

  const isGranted = (resource, action) => {
    return permissionsToGrant.some(p => p.resource === resource && p.action === action);
  };

  const isRevoked = (resource, action) => {
    return permissionsToRevoke.some(p => p.resource === resource && p.action === action);
  };

  const toggleGrant = (resource, action) => {
    const exists = isGranted(resource, action);
    if (exists) {
      setPermissionsToGrant(prev => 
        prev.filter(p => !(p.resource === resource && p.action === action))
      );
    } else {
      setPermissionsToGrant(prev => [...prev, { resource, action }]);
    }
  };

  const toggleRevoke = (resource, action) => {
    const exists = isRevoked(resource, action);
    if (exists) {
      setPermissionsToRevoke(prev => 
        prev.filter(p => !(p.resource === resource && p.action === action))
      );
    } else {
      setPermissionsToRevoke(prev => [...prev, { resource, action }]);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Sélectionnez un utilisateur");
      return;
    }

    if (!reason.trim()) {
      toast.error("Veuillez indiquer une raison pour les modifications");
      return;
    }
    
    try {
      const addedPermissions = {};
      permissionsToGrant.forEach(p => {
        if (!addedPermissions[p.resource]) addedPermissions[p.resource] = [];
        addedPermissions[p.resource].push(p.action);
      });

      const removedPermissions = {};
      permissionsToRevoke.forEach(p => {
        if (!removedPermissions[p.resource]) removedPermissions[p.resource] = [];
        removedPermissions[p.resource].push(p.action);
      });

      // ✅ FIX: Ne pas envoyer businessId si undefined/null
      const payload = {
        userId: user.id,
        addedPermissions,
        removedPermissions,
        reason: reason.trim(),
        expiresAt: expiresAt || null,
      };

      if (user.businessId) {
        payload.businessId = user.businessId;
      }

      const res = await fetch("/api/permission-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`Permissions de ${user.firstName} ${user.lastName} mises à jour`);
        router.push("/reglages/permissions");
      } else {
        const data = await res.json();
        toast.error(data.message || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur serveur");
    }
  };

  const totalChanges = permissionsToGrant.length + permissionsToRevoke.length;

  if (loading) {
    return <PermissionsEditSkeleton />;
  }

  if (isNewMode && !selectedUserId) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 px-5 py-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/reglages/permissions")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Personnaliser les permissions</h1>
            <p className="text-muted-foreground">
              Sélectionnez un utilisateur pour modifier ses permissions
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sélectionner un utilisateur</CardTitle>
            <CardDescription>
              Choisissez l'utilisateur dont vous souhaitez personnaliser les permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setSelectedUserId(u.id);
                  setUser(u);
                  loadOverrides(u);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {u.firstName[0]}{u.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{u.firstName} {u.lastName}</p>
                  <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                </div>
                <Badge className={roleLabels[u.role].color}>
                  {roleLabels[u.role].label}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
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
    <div className="max-w-md md:max-w-lg lg:max-w-4xl mx-auto space-y-6 px-5 py-6">
      {/* Header + User Info (identique) */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/reglages/permissions")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Modifier les permissions</h1>
          <p className="text-muted-foreground">Personnalisez les accès de cet utilisateur</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="text-right">
              <Badge className={roleLabels[user.role].color}>
                {roleLabels[user.role].label}
              </Badge>
              {user.businessName && (
                <p className="text-sm text-muted-foreground mt-1">{user.businessName}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions du rôle (identique) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            Permissions du rôle {roleLabels[user.role].label}
          </CardTitle>
          <CardDescription>Permissions de base accordées par le rôle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allResources.map((resource) => {
              const perms = basePermissions.filter(p => p.resource === resource);
              if (perms.length === 0) return null;
              
              return (
                <div key={resource} className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <span>{resourceLabels[resource]?.icon}</span>
                    {resourceLabels[resource]?.label}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {perms.map((p) => (
                      <Badge key={p.action} variant="secondary" className="text-xs">
                        {actionLabels[p.action]}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Permissions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-emerald-600">
            <Check className="h-4 w-4" />
            Ajouter des permissions
          </CardTitle>
          <CardDescription>
            Accorder des permissions supplémentaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {allResources.map((resource) => {
              const availableToGrant = allActions.filter(
                action => !hasBasePermission(resource, action)
              );
              
              if (availableToGrant.length === 0) return null;
              
              return (
                <AccordionItem key={resource} value={resource}>
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex items-center gap-2">
                      <span>{resourceLabels[resource]?.icon}</span>
                      {resourceLabels[resource]?.label}
                      {permissionsToGrant.filter(p => p.resource === resource).length > 0 && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-0 ml-2">
                          {permissionsToGrant.filter(p => p.resource === resource).length}
                        </Badge>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {availableToGrant.map((action) => (
                        <label
                          key={action}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={isGranted(resource, action)}
                            onCheckedChange={() => toggleGrant(resource, action)}
                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                          />
                          <span className="text-sm">{actionLabels[action]}</span>
                        </label>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Revoke Permissions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-amber-600">
            <X className="h-4 w-4" />
            Retirer des permissions
          </CardTitle>
          <CardDescription>
            Retirer des permissions du rôle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {allResources.map((resource) => {
              const availableToRevoke = allActions.filter(
                action => hasBasePermission(resource, action)
              );
              
              if (availableToRevoke.length === 0) return null;
              
              return (
                <AccordionItem key={resource} value={`revoke-${resource}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex items-center gap-2">
                      <span>{resourceLabels[resource]?.icon}</span>
                      {resourceLabels[resource]?.label}
                      {permissionsToRevoke.filter(p => p.resource === resource).length > 0 && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-0 ml-2">
                          {permissionsToRevoke.filter(p => p.resource === resource).length}
                        </Badge>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {availableToRevoke.map((action) => (
                        <label
                          key={action}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={isRevoked(resource, action)}
                            onCheckedChange={() => toggleRevoke(resource, action)}
                            className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                          />
                          <span className="text-sm">{actionLabels[action]}</span>
                        </label>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Détails de la modification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Raison <span className="text-destructive">*</span></Label>
            <Textarea
              id="reason"
              placeholder="Ex: Gérant senior responsable catalogue..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expires">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date d'expiration (optionnel)
            </Label>
            <Input
              id="expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => router.push("/reglages/permissions")}>
          Annuler
        </Button>
        <Button 
          onClick={handleSave}
          disabled={totalChanges === 0 || !reason.trim()}
          className="gap-2 bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
        >
          <Check className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>
    </div>
  );
};

export default Page;