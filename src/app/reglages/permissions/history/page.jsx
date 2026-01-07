"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

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

export default function PermissionsHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/permission-overrides/history");
        const data = await res.json();
        setHistory(data.data || []);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        entry.userName?.toLowerCase().includes(searchLower) ||
        entry.adminName?.toLowerCase().includes(searchLower) ||
        entry.reason?.toLowerCase().includes(searchLower);

      const matchesAction = actionFilter === "all" || entry.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [history, searchQuery, actionFilter]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'grant':
        return '✅';
      case 'revoke':
        return '❌';
      case 'mixed':
        return '🔄';
      case 'reset':
        return '↺';
      default:
        return '•';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'grant':
        return 'Permissions ajoutées';
      case 'revoke':
        return 'Permissions retirées';
      case 'mixed':
        return 'Permissions modifiées';
      case 'reset':
        return 'Reset complet';
      default:
        return action;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'grant':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'revoke':
        return 'bg-amber-500/10 text-amber-600';
      case 'mixed':
        return 'bg-blue-500/10 text-blue-600';
      case 'reset':
        return 'bg-gray-500/10 text-gray-600';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/permissions")}
          className="mb-4 text-primary hover:underline"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold">Historique des modifications</h1>
        <p className="text-muted-foreground">
          Suivi de toutes les modifications de permissions
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 border rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">Toutes les actions</option>
            <option value="grant">Ajouts</option>
            <option value="revoke">Retraits</option>
            <option value="mixed">Modifications</option>
            <option value="reset">Reset</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="border rounded-lg divide-y">
        <div className="p-4 bg-muted">
          <div className="font-medium">
            Chronologie ({filteredHistory.length} entrées)
          </div>
        </div>

        <div className="divide-y">
          {filteredHistory.map((entry) => (
            <div key={entry.id} className="p-4 hover:bg-muted/30">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(entry.action)}`}>
                  <span className="text-xl">{getActionIcon(entry.action)}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${getActionColor(entry.action)}`}>
                      {getActionLabel(entry.action)}
                    </span>
                    <span className="text-sm text-muted-foreground">sur</span>
                    <span className="font-medium">{entry.userName}</span>
                  </div>

                  {/* Permissions affectées */}
                  {entry.permissions && entry.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.permissions.slice(0, 3).map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-muted rounded text-xs"
                        >
                          {resourceLabels[p.resource]?.icon} {resourceLabels[p.resource]?.label}: {actionLabels[p.action]}
                        </span>
                      ))}
                      {entry.permissions.length > 3 && (
                        <span className="px-2 py-0.5 bg-muted rounded text-xs">
                          +{entry.permissions.length - 3} autres
                        </span>
                      )}
                    </div>
                  )}

                  {/* Raison et métadonnées */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
                    <p className="truncate">📝 {entry.reason}</p>
                    <div className="flex items-center gap-3">
                      <span>Par {entry.adminName}</span>
                      <span>{new Date(entry.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Aucune entrée trouvée
          </div>
        )}
      </div>
    </div>
  );
}