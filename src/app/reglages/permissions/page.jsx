"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Clock,
  ChevronLeft,
  Users,
  Shield,
  History,
} from "lucide-react";
import toast from "react-hot-toast";
import { PermissionsListSkeleton } from "@/components/skeleton/PermissionsListSkeleton";

const roleLabels = {
  admin: { label: 'Administrateur', color: 'bg-red-500/10 text-red-600 border-red-500/30' },
  gerant: { label: 'Gérant', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  comptable: { label: 'Comptable', color: 'bg-green-500/10 text-green-600 border-green-500/30' },
  vendeur: { label: 'Vendeur', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
};

const Page = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [businessFilter, setBusinessFilter] = useState("all");
  const [overrideFilter, setOverrideFilter] = useState("all");
  const [userToReset, setUserToReset] = useState(null);
  
  // États pour données API
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users et businesses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersRes = await fetch("/api/user?limit=100");
        const usersData = await usersRes.json();
        
        // Fetch businesses
        const businessRes = await fetch("/api/shop?limit=100");
        const businessData = await businessRes.json();

        // Pour chaque utilisateur non-admin, fetch ses overrides
        const usersWithOverrides = await Promise.all(
          (usersData.data || [])
            .filter(u => u.role !== "admin")
            .map(async (user) => {
              try {
                const overrideRes = await fetch(
                  `/api/permission-overrides?userId=${user._id}&businessId=${user.business}`
                );
                const overrideData = await overrideRes.json();
                
                // Transformer en format attendu
                const overrides = [];
                if (overrideData.data) {
                  const { addedPermissions, removedPermissions, expiresAt, reason, createdAt } = overrideData.data;
                  
                  // Convertir addedPermissions en array d'overrides
                  if (addedPermissions) {
                    Object.entries(addedPermissions).forEach(([resource, actions]) => {
                      actions.forEach(action => {
                        overrides.push({
                          id: `${user._id}-grant-${resource}-${action}`,
                          type: 'grant',
                          permission: { resource, action },
                          reason: reason || '',
                          expiresAt,
                          createdAt,
                        });
                      });
                    });
                  }
                  
                  // Convertir removedPermissions en array d'overrides
                  if (removedPermissions) {
                    Object.entries(removedPermissions).forEach(([resource, actions]) => {
                      actions.forEach(action => {
                        overrides.push({
                          id: `${user._id}-revoke-${resource}-${action}`,
                          type: 'revoke',
                          permission: { resource, action },
                          reason: reason || '',
                          expiresAt,
                          createdAt,
                        });
                      });
                    });
                  }
                }
                
                return {
                  id: user._id,
                  firstName: user.prenom || '',
                  lastName: user.nom || '',
                  email: user.email,
                  role: user.role,
                  businessId: user.business,
                  businessName: user.businessName || '',
                  avatar: user.avatar || '',
                  overrides,
                };
              } catch (err) {
                return {
                  id: user._id,
                  firstName: user.prenom || '',
                  lastName: user.nom || '',
                  email: user.email,
                  role: user.role,
                  businessId: user.business,
                  businessName: user.businessName || '',
                  avatar: user.avatar || '',
                  overrides: [],
                };
              }
            })
        );

        setUsers(usersWithOverrides);
        setBusinesses(businessData.data || []);
      } catch (error) {
        console.error("Erreur chargement:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper pour déterminer le type de badge
  const getOverrideBadgeType = (overrides) => {
    if (!overrides || overrides.length === 0) return 'none';
    const hasGrant = overrides.some(o => o.type === 'grant');
    const hasRevoke = overrides.some(o => o.type === 'revoke');
    if (hasGrant && hasRevoke) return 'mixed';
    if (hasGrant) return 'grant';
    if (hasRevoke) return 'revoke';
    return 'none';
  };

  // Filtrer les utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filtre recherche
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);

      // Filtre rôle
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // Filtre boutique
      const matchesBusiness = businessFilter === "all" || user.businessId === businessFilter;

      // Filtre overrides
      const badgeType = getOverrideBadgeType(user.overrides);
      const matchesOverride = 
        overrideFilter === "all" ||
        (overrideFilter === "with" && badgeType !== 'none') ||
        (overrideFilter === "without" && badgeType === 'none') ||
        (overrideFilter === "expired" && user.overrides.some(o => 
          o.expiresAt && new Date(o.expiresAt) < new Date()
        ));

      return matchesSearch && matchesRole && matchesBusiness && matchesOverride;
    });
  }, [users, searchQuery, roleFilter, businessFilter, overrideFilter]);

  const getOverrideBadge = (user) => {
    const badgeType = getOverrideBadgeType(user.overrides);
    const hasExpiring = user.overrides.some(o => {
      if (!o.expiresAt) return false;
      const expiry = new Date(o.expiresAt);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    const hasExpired = user.overrides.some(o => 
      o.expiresAt && new Date(o.expiresAt) < new Date()
    );

    if (hasExpired) {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Expiré
        </Badge>
      );
    }

    switch (badgeType) {
      case 'grant':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 border">
            {user.overrides.length} ajoutée{user.overrides.length > 1 ? 's' : ''}
            {hasExpiring && <Clock className="w-3 h-3 ml-1" />}
          </Badge>
        );
      case 'revoke':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 border">
            {user.overrides.length} retirée{user.overrides.length > 1 ? 's' : ''}
            {hasExpiring && <Clock className="w-3 h-3 ml-1" />}
          </Badge>
        );
      case 'mixed':
        return (
          <Badge className="bg-primary/10 text-primary border-primary/30 border">
            {user.overrides.length} modifiée{user.overrides.length > 1 ? 's' : ''}
            {hasExpiring && <Clock className="w-3 h-3 ml-1" />}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-muted-foreground">
            Par défaut
          </Badge>
        );
    }
  };

  const handleResetOverrides = async () => {
    if (!userToReset) return;
    
    try {
      const res = await fetch(
        `/api/permission-overrides?userId=${userToReset.id}&businessId=${userToReset.businessId}`,
        { method: "DELETE" }
      );
      
      if (res.ok) {
        toast.success(`Permissions de ${userToReset.firstName} ${userToReset.lastName} réinitialisées`);
        // Recharger les données
        window.location.reload();
      } else {
        toast.error("Erreur lors de la réinitialisation");
      }
    } catch (error) {
      toast.error("Erreur serveur");
    } finally {
      setUserToReset(null);
    }
  };

  const stats = useMemo(() => {
    const usersWithOverrides = users.filter(u => u.overrides.length > 0);
    const expiringOverrides = users.flatMap(u => u.overrides).filter(o => {
      if (!o.expiresAt) return false;
      const expiry = new Date(o.expiresAt);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    return {
      totalUsers: users.length,
      usersWithOverrides: usersWithOverrides.length,
      expiringCount: expiringOverrides.length,
    };
  }, [users]);

  if (loading) {
    return (
      <>
        <PermissionsListSkeleton />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6 px-5 md:px-10 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push("/reglages")}
              className="shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Gestion des permissions
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Personnalisez les accès de chaque utilisateur
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/reglages/permissions/history")}
              className="gap-2 hover:cursor-pointer"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historique</span>
            </Button>
            <Button 
              onClick={() => router.push("/reglages/permissions/edit/new")}
              className="gap-2 bg-blue-600 hover:cursor-pointer hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Personnaliser</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1166D4]/10">
                <Users className="h-6 w-6 text-[#1166D4]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/10">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.usersWithOverrides}</p>
                <p className="text-sm text-muted-foreground">Avec overrides</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.expiringCount}</p>
                <p className="text-sm text-muted-foreground">Bientôt expirées</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="gerant">Gérant</SelectItem>
                    <SelectItem value="comptable">Comptable</SelectItem>
                    <SelectItem value="vendeur">Vendeur</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={businessFilter} onValueChange={setBusinessFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Boutique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les boutiques</SelectItem>
                    {businesses.map(b => (
                      <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={overrideFilter} onValueChange={setOverrideFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Permissions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="with">Avec overrides</SelectItem>
                    <SelectItem value="without">Sans override</SelectItem>
                    <SelectItem value="expired">Expirées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Utilisateurs ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Boutique</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleLabels[user.role].color}>
                          {roleLabels[user.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.businessName || '-'}
                      </TableCell>
                      <TableCell>
                        {getOverrideBadge(user)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/reglages/permissions/view/${user.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir les permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/reglages/permissions/edit/${user.id}`)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            {user.overrides.length > 0 && (
                              <DropdownMenuItem 
                                onClick={() => setUserToReset(user)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Réinitialiser
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/reglages/permissions/view/${user.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/reglages/permissions/edit/${user.id}`)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        {user.overrides.length > 0 && (
                          <DropdownMenuItem 
                            onClick={() => setUserToReset(user)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Réinitialiser
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={roleLabels[user.role].color}>
                      {roleLabels[user.role].label}
                    </Badge>
                    {user.businessName && (
                      <Badge variant="outline">{user.businessName}</Badge>
                    )}
                    {getOverrideBadge(user)}
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Aucun utilisateur trouvé
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={!!userToReset} onOpenChange={() => setUserToReset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser les permissions</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer tous les overrides de {userToReset?.firstName} {userToReset?.lastName} ?
              <br />
              L'utilisateur retrouvera les permissions par défaut de son rôle ({roleLabels[userToReset?.role]?.label}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetOverrides} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Page;