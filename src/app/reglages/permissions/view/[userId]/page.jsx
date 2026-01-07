"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

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

export default function PermissionsViewPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId;

  const [user, setUser] = useState(null);
  const [overrides, setOverrides] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userRes = await fetch(`/api/user/${userId}`);
        const userData = await userRes.json();
        
        if (userData.data) {
          setUser(userData.data);

          // Fetch overrides
          const overrideRes = await fetch(
            `/api/permission-overrides?userId=${userData.data._id}&businessId=${userData.data.business}`
          );
          const overrideData = await overrideRes.json();
          setOverrides(overrideData.data);
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!user) {
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

  const hasAdded = overrides?.addedPermissions && 
    Object.keys(overrides.addedPermissions).length > 0;
  const hasRemoved = overrides?.removedPermissions && 
    Object.keys(overrides.removedPermissions).length > 0;

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/permissions")}
            className="mb-4 text-primary hover:underline"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold">Permissions de l'utilisateur</h1>
          <p className="text-muted-foreground">Vue détaillée des accès</p>
        </div>
        <button
          onClick={() => router.push(`/reglages/permissions/edit/${user._id}`)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          ✏️ Modifier
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border rounded-lg">
        <div className="text-xl font-semibold">
          {user.prenom} {user.nom}
        </div>
        <div className="text-muted-foreground">{user.email}</div>
        <div className="mt-2">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
            {user.role}
          </span>
        </div>
      </div>

      {/* Permissions du rôle */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">
          Permissions du rôle {user.role}
        </h2>
        <p className="text-sm text-muted-foreground">
          Permissions de base accordées par le rôle
        </p>
      </div>

      {/* Overrides (si présents) */}
      {(hasAdded || hasRemoved) && (
        <div className="border rounded-lg p-4 space-y-4">
          <h2 className="text-xl font-semibold">Personnalisations actives</h2>

          {/* Permissions ajoutées */}
          {hasAdded && (
            <div>
              <h3 className="font-medium text-emerald-600 mb-2">
                ✅ Permissions ajoutées
              </h3>
              <div className="space-y-2">
                {Object.entries(overrides.addedPermissions).map(([resource, actions]) => (
                  <div key={resource} className="flex items-start gap-2">
                    <span className="text-lg">{resourceLabels[resource]?.icon}</span>
                    <div>
                      <div className="font-medium">{resourceLabels[resource]?.label}</div>
                      <div className="flex flex-wrap gap-1">
                        {actions.map(action => (
                          <span
                            key={action}
                            className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-xs"
                          >
                            {actionLabels[action]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permissions retirées */}
          {hasRemoved && (
            <div>
              <h3 className="font-medium text-amber-600 mb-2">
                ❌ Permissions retirées
              </h3>
              <div className="space-y-2">
                {Object.entries(overrides.removedPermissions).map(([resource, actions]) => (
                  <div key={resource} className="flex items-start gap-2">
                    <span className="text-lg">{resourceLabels[resource]?.icon}</span>
                    <div>
                      <div className="font-medium">{resourceLabels[resource]?.label}</div>
                      <div className="flex flex-wrap gap-1">
                        {actions.map(action => (
                          <span
                            key={action}
                            className="px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded text-xs"
                          >
                            {actionLabels[action]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Métadonnées */}
          {overrides.reason && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                📝 Raison : {overrides.reason}
              </p>
              {overrides.expiresAt && (
                <p className="text-sm text-muted-foreground">
                  ⏰ Expire le : {new Date(overrides.expiresAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Aucun override */}
      {!hasAdded && !hasRemoved && (
        <div className="border rounded-lg p-4 text-center text-muted-foreground">
          Aucune personnalisation. Cet utilisateur utilise les permissions par défaut de son rôle.
        </div>
      )}
    </div>
  );
}