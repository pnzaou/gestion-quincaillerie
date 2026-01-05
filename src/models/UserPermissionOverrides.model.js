import mongoose from "mongoose";

/**
 * Modèle pour gérer les permissions personnalisées par utilisateur
 * Permet d'ajouter ou retirer des permissions spécifiques à un utilisateur
 * sans modifier son rôle de base
 */
const userPermissionOverridesSchema = new mongoose.Schema({
  // Référence vers l'utilisateur
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Référence vers la boutique (pour multi-tenant)
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },

  // Permissions AJOUTÉES (en plus de celles du rôle)
  // Format: { resource: [actions] }
  // Exemple: { reports: ["export"], users: ["read"] }
  addedPermissions: {
    type: Map,
    of: [String],
    default: {},
  },

  // Permissions RETIRÉES (même si le rôle les a)
  // Format: { resource: [actions] }
  // Exemple: { products: ["delete"], sales: ["cancel"] }
  removedPermissions: {
    type: Map,
    of: [String],
    default: {},
  },

  // Raison de l'override (pour traçabilité)
  reason: {
    type: String,
    required: false,
  },

  // Utilisateur qui a créé cet override
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Date d'expiration (optionnel - pour permissions temporaires)
  expiresAt: {
    type: Date,
    required: false,
  },

  // Statut
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index unique : un seul override par utilisateur + boutique
userPermissionOverridesSchema.index({ user: 1, business: 1 }, { unique: true });

// Index pour recherche rapide
userPermissionOverridesSchema.index({ business: 1, isActive: 1 });
userPermissionOverridesSchema.index({ expiresAt: 1 });

// Méthode pour vérifier si l'override a expiré
userPermissionOverridesSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Méthode pour désactiver automatiquement si expiré
userPermissionOverridesSchema.pre('save', function(next) {
  if (this.isExpired()) {
    this.isActive = false;
  }
  next();
});

const UserPermissionOverrides = mongoose.models.UserPermissionOverrides || 
  mongoose.model("UserPermissionOverrides", userPermissionOverridesSchema);

export default UserPermissionOverrides;