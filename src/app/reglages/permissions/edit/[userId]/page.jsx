"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

// Définition des ressources et actions (depuis /lib/permissions.js)
const RESOURCES = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  CLIENTS: 'clients',
  SALES: 'sales',
  ORDERS: 'orders',
  SUPPLIERS: 'suppliers',
  USERS: 'users',
  SETTINGS: 'settings',
  REPORTS: 'reports',
  PAYMENTS: 'payments',
};

const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  EXPORT: 'export',
  IMPORT: 'import',
};

const allResources = Object.values(RESOURCES);
const allActions = Object.values(ACTIONS);

const resourceLabels = {
  products: { label: 'Produits', icon: '📦' },
  categories: { label: 'Catégories', icon: '🏪' },
  clients: { label: 'Clients', icon: '👥' },
  sales: { label: 'Ventes', icon: '💰' },
  orders: { label: 'Commandes', icon: '📋' },
  suppliers: { label: 'Fournisseurs', icon: '🚚' },
  users: { label: 'Utilisateurs', icon: '👤' },
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

export default function PermissionsEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId;
  const isNewMode = userId === 'new';

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // État des permissions à ajouter/retirer
  const [addedPermissions, setAddedPermissions] = useState({});
  const [removedPermissions, setRemovedPermissions] = useState({});
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Fetch users disponibles
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/user?limit=100");
        const data = await res.json();
        const nonAdmins = data.data?.filter(u => u.role !== "admin") || [];
        setUsers(nonAdmins);

        // Si mode edit, charger l'utilisateur spécifique
        if (!isNewMode) {
          const user = nonAdmins.find(u => u._id === userId);
          setSelectedUser(user);
          
          // Charger les overrides existants
          if (user) {
            const overrideRes = await fetch(
              `/api/permission-overrides?userId=${user._id}&businessId=${user.business}`
            );
            const overrideData = await overrideRes.json();
            if (overrideData.data) {
              setAddedPermissions(overrideData.data.addedPermissions || {});
              setRemovedPermissions(overrideData.data.removedPermissions || {});
              setReason(overrideData.data.reason || "");
              setExpiresAt(overrideData.data.expiresAt ? 
                new Date(overrideData.data.expiresAt).toISOString().split('T')[0] : ""
              );
            }
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

  const toggleAddedPermission = (resource, action) => {
    setAddedPermissions(prev => {
      const current = prev[resource] || [];
      const exists = current.includes(action);
      
      return {
        ...prev,
        [resource]: exists 
          ? current.filter(a => a !== action)
          : [...current, action]
      };
    });
  };

  const toggleRemovedPermission = (resource, action) => {
    setRemovedPermissions(prev => {
      const current = prev[resource] || [];
      const exists = current.includes(action);
      
      return {
        ...prev,
        [resource]: exists 
          ? current.filter(a => a !== action)
          : [...current, action]
      };
    });
  };

  const handleSave = async () => {
    if (!selectedUser) {
      toast.error("Sélectionnez un utilisateur");
      return;
    }

    if (!reason.trim()) {
      toast.error("Veuillez indiquer une raison");
      return;
    }

    try {
      const res = await fetch("/api/permission-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser._id,
          businessId: selectedUser.business,
          addedPermissions,
          removedPermissions,
          reason: reason.trim(),
          expiresAt: expiresAt || null,
        }),
      });

      if (res.ok) {
        toast.success("Permissions mises à jour");
        router.push("/permissions");
      } else {
        const data = await res.json();
        toast.error(data.message || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur serveur");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  // Mode sélection utilisateur
  if (isNewMode && !selectedUser) {
    return (
      <div className="container mx-auto py-6 max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Personnaliser les permissions</h1>
          <p className="text-muted-foreground">
            Sélectionnez un utilisateur
          </p>
        </div>

        <div className="space-y-2">
          {users.map(user => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className="w-full p-4 border rounded-lg hover:bg-muted text-left"
            >
              <div className="font-medium">{user.prenom} {user.nom}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Rôle: {user.role}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Utilisateur non trouvé</p>
        <button
          onClick={() => router.push("/permissions")}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retour
        </button>
      </div>
    );
  }

  const totalChanges = 
    Object.values(addedPermissions).flat().length +
    Object.values(removedPermissions).flat().length;

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/permissions")}
          className="mb-4 text-primary hover:underline"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold">Modifier les permissions</h1>
        <p className="text-muted-foreground">
          Personnalisez les accès de {selectedUser.prenom} {selectedUser.nom}
        </p>
      </div>

      {/* User Info */}
      <div className="p-4 border rounded-lg">
        <div className="font-medium">{selectedUser.prenom} {selectedUser.nom}</div>
        <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
        <div className="text-sm text-muted-foreground">Rôle: {selectedUser.role}</div>
      </div>

      {/* Ajouter permissions */}
      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold text-emerald-600">
          ✅ Ajouter des permissions
        </h2>
        {allResources.map(resource => (
          <details key={resource} className="border-b pb-2">
            <summary className="cursor-pointer font-medium py-2">
              {resourceLabels[resource].icon} {resourceLabels[resource].label}
            </summary>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {allActions.map(action => (
                <label key={action} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addedPermissions[resource]?.includes(action) || false}
                    onChange={() => toggleAddedPermission(resource, action)}
                  />
                  <span className="text-sm">{actionLabels[action]}</span>
                </label>
              ))}
            </div>
          </details>
        ))}
      </div>

      {/* Retirer permissions */}
      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold text-amber-600">
          ❌ Retirer des permissions
        </h2>
        {allResources.map(resource => (
          <details key={resource} className="border-b pb-2">
            <summary className="cursor-pointer font-medium py-2">
              {resourceLabels[resource].icon} {resourceLabels[resource].label}
            </summary>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {allActions.map(action => (
                <label key={action} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removedPermissions[resource]?.includes(action) || false}
                    onChange={() => toggleRemovedPermission(resource, action)}
                  />
                  <span className="text-sm">{actionLabels[action]}</span>
                </label>
              ))}
            </div>
          </details>
        ))}
      </div>

      {/* Métadonnées */}
      <div className="border rounded-lg p-4 space-y-4">
        <div>
          <label className="block font-medium mb-2">
            Raison <span className="text-destructive">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Gérant senior responsable catalogue..."
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
          />
        </div>
        <div>
          <label className="block font-medium mb-2">
            Date d'expiration (optionnel)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Aperçu */}
      {totalChanges > 0 && (
        <div className="border border-primary rounded-lg p-4 bg-primary/5">
          <h3 className="font-semibold mb-2">Aperçu des changements</h3>
          <p className="text-sm text-muted-foreground">
            {totalChanges} modification{totalChanges > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/permissions")}
          className="px-4 py-2 border rounded-lg hover:bg-muted"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={totalChanges === 0 || !reason.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}