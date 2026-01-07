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

const allResources = [
  'products', 'categories', 'clients', 'users', 
  'sales', 'orders', 'suppliers', 'settings', 'reports', 'payments'
];

const allActions = ['create', 'read', 'update', 'delete', 'list', 'import', 'export'];

const resourceLabels = {
  products: { label: 'Produits', icon: '📦' },
  categories: { label: 'Catégories', icon: '🏪' },
  clients: { label: 'Clients', icon: '👥' },
  users: { label: 'Utilisateurs', icon: '👤' },
  sales: { label: 'Ventes', icon: '💰' },
  orders: { label: 'Commandes', icon: '📋' },
  suppliers: { label: 'Fournisseurs', icon: '🚚' },
  settings: { label: 'Paramètres', icon: '⚙️' },
  reports: { label: 'Rapports', icon: '📊' },
  payments: { label: 'Paiements', icon: '💳' },
};

const actionLabels = {
  create: 'Créer',
  read: 'Lire',
  update: 'Modifier',
  delete: 'Supprimer',
  list: 'Lister',
  export: 'Exporter',
  import: 'Importer',
};

const roleLabels = {
  admin: { label: 'Administrateur', color: 'bg-red-500/10 text-red-600 border-red-500/30' },
  gerant: { label: 'Gérant', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  comptable: { label: 'Comptable', color: 'bg-green-500/10 text-green-600 border-green-500/30' },
  vendeur: { label: 'Vendeur', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
};

// Permissions par défaut selon rôle (simplifié - à adapter selon votre logique)
const defaultRolePermissions = {
  admin: allResources.flatMap(r => allActions.map(a => ({ resource: r, action: a }))),
  gerant: [
    { resource: 'products', action: 'create' },
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'update' },
    { resource: 'products', action: 'list' },
    { resource: 'sales', action: 'create' },
    { resource: 'sales', action: 'read' },
    { resource: 'sales', action: 'list' },
    // etc...
  ],
  comptable: [
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'list' },
    { resource: 'sales', action: 'read' },
    { resource: 'sales', action: 'list' },
    // etc...
  ],
  vendeur: [],
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
  
  const basePermissions = useMemo(() => 
    user ? (defaultRolePermissions[user.role] || []) : [],
    [user]
  );

  const [permissionsToGrant, setPermissionsToGrant] = useState([]);
  const [permissionsToRevoke, setPermissionsToRevoke] = useState([]);
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const availableUsers = useMemo(() => 
    users.filter(u => u.role !== 'admin'),
    [users]
  );

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/user?limit=100");
        const data = await res.json();
        const allUsers = (data.data || []).map(u => ({
          id: u._id,
          firstName: u.prenom || '',
          lastName: u.nom || '',
          email: u.email,
          role: u.role,
          businessId: u.business,
          businessName: u.businessName || '',
          avatar: u.avatar || '',
        }));
        
        setUsers(allUsers);

        if (!isNewMode) {
          const foundUser = allUsers.find(u => u.id === userId);
          if (foundUser) {
            setUser(foundUser);
            // Charger les overrides existants
            await loadOverrides(foundUser);
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, isNewMode]);

  const loadOverrides = async (userToLoad) => {
    try {
      const res = await fetch(
        `/api/permission-overrides?userId=${userToLoad.id}&businessId=${userToLoad.businessId}`
      );
      const data = await res.json();
      
      if (data.data) {
        const { addedPermissions, removedPermissions, reason: existingReason, expiresAt: existingExpiry } = data.data;
        
        // Convertir en array
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
      // Convertir en format API
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

      const res = await fetch("/api/permission-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          businessId: user.businessId,
          addedPermissions,
          removedPermissions,
          reason: reason.trim(),
          expiresAt: expiresAt || null,
        }),
      });

      if (res.ok) {
        toast.success(`Permissions de ${user.firstName} ${user.lastName} mises à jour avec succès`);
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
    return (
      <>
        <PermissionsEditSkeleton />
      </>
    );
  }

  // Si mode nouveau et pas d'utilisateur sélectionné
  if (isNewMode && !selectedUserId) {
    return (
      <>
        <div className="max-w-3xl mx-auto space-y-6">
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
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Utilisateur non trouvé</p>
          <Button onClick={() => router.push("/reglages/permissions")} className="mt-4">
            Retour à la liste
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-md md:max-w-lg lg:max-w-4xl mx-auto space-y-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/reglages/permissions")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Modifier les permissions</h1>
            <p className="text-muted-foreground">
              Personnalisez les accès de cet utilisateur
            </p>
          </div>
        </div>

        {/* User Info Card */}
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
                <p className="text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="text-right">
                <Badge className={roleLabels[user.role].color}>
                  {roleLabels[user.role].label}
                </Badge>
                {user.businessName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.businessName}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Role Permissions (Read-only) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              Permissions du rôle {roleLabels[user.role].label}
            </CardTitle>
            <CardDescription>
              Permissions de base accordées par le rôle (lecture seule)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allResources.map((resource) => {
                const perms = basePermissions.filter(p => p.resource === resource);
                if (perms.length === 0) return null;
                
                return (
                  <div key={resource} className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <span>{resourceLabels[resource].icon}</span>
                      {resourceLabels[resource].label}
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

        {/* Add Permissions Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-600">
              <Check className="h-4 w-4" />
              Ajouter des permissions
            </CardTitle>
            <CardDescription>
              Accorder des permissions supplémentaires à cet utilisateur
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
                        <span>{resourceLabels[resource].icon}</span>
                        {resourceLabels[resource].label}
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

        {/* Revoke Permissions Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
              <X className="h-4 w-4" />
              Retirer des permissions
            </CardTitle>
            <CardDescription>
              Retirer des permissions que l'utilisateur possède par son rôle
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
                        <span>{resourceLabels[resource].icon}</span>
                        {resourceLabels[resource].label}
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

        {/* Metadata Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Détails de la modification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="flex items-center gap-1">
                Raison <span className="text-destructive">*</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (Obligatoire pour traçabilité)
                </span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Ex: Gérant senior responsable catalogue..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date d'expiration
                <span className="text-xs text-muted-foreground">
                  (Optionnel - utile pour permissions temporaires)
                </span>
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

        {/* Warning if too many revokes */}
        {permissionsToRevoke.length > 5 && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-600">Attention</p>
              <p className="text-sm text-muted-foreground">
                Vous retirez beaucoup de permissions. Cet utilisateur n'aura presque plus aucun accès.
              </p>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {totalChanges > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Aperçu des changements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {permissionsToGrant.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-emerald-600 mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Permissions ajoutées ({permissionsToGrant.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {permissionsToGrant.map((p) => (
                      <Badge key={`${p.resource}-${p.action}`} className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                        {resourceLabels[p.resource].icon} {resourceLabels[p.resource].label}: {actionLabels[p.action]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {permissionsToRevoke.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-2 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Permissions retirées ({permissionsToRevoke.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {permissionsToRevoke.map((p) => (
                      <Badge key={`${p.resource}-${p.action}`} className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                        {resourceLabels[p.resource].icon} {resourceLabels[p.resource].label}: {actionLabels[p.action]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="text-sm text-muted-foreground space-y-1">
                <p>📝 Raison : {reason || <span className="text-destructive">Non renseignée</span>}</p>
                <p>⏰ Expire le : {expiresAt || "Permanent"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push("/reglages/permissions")}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={totalChanges === 0 || !reason.trim()}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </div>
    </>
  );
};

export default Page;