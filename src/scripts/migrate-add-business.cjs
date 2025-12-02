// scripts/migrate-add-business-manual.js

/**
 * Script de migration (option C) :
 * - Ne crée aucune Business.
 * - Lit un DEFAULT_BUSINESS_ID (env) ou des overrides depuis ./scripts/migration-config.json
 * - Met à jour les documents n'ayant pas de champ `business`.
 *
 * Usage:
 *  - dry-run (ne modifie rien) : node scripts/migrate-add-business-manual.js --dry
 *  - exécution : node scripts/migrate-add-business-manual.js
 *
 * IMPORTANT: Assure-toi que MONGODB_URI est dans ton .env ou env vars.
 */

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

function norm(m) {
  return (m && m.__esModule && m.default) ? m.default : m;
}

const _Product = require("../models/Product.model");
const _Category = require("../models/Category.model");
const _Sale = require("../models/Sale.model");
const _Order = require("../models/Order.model");
const _Supplier = require("../models/Supplier.model");
const _Client = require("../models/Client.model");
const _ClientAccount = require("../models/ClientAccount.model");
const _AccountTransaction = require("../models/AccountTransaction.model");
const _History = require("../models/History.model");
const _Payment = require("../models/Payment.model");
const _Quote = require("../models/Quote.model");
const _Promotion = require("../models/Promotion.model");
const _Outbox = require("../models/Outbox.model");
const _User = require("../models/User.model");
const _PasswordResetToken = require("../models/PasswordResetToken.model");
const _Business = require("../models/Business.model");

// normalised models to use below
const Product = norm(_Product);
const Category = norm(_Category);
const Sale = norm(_Sale);
const Order = norm(_Order);
const Supplier = norm(_Supplier);
const Client = norm(_Client);
const ClientAccount = norm(_ClientAccount);
const AccountTransaction = norm(_AccountTransaction);
const History = norm(_History);
const Payment = norm(_Payment);
const Quote = norm(_Quote);
const Promotion = norm(_Promotion);
const Outbox = norm(_Outbox);
const User = norm(_User);
const PasswordResetToken = norm(_PasswordResetToken);
const Business = norm(_Business);

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI non défini dans les env.");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry") || process.argv.includes("-d");

const CONFIG_PATH = path.resolve(__dirname, "migration-config.json");

let config = {};
if (fs.existsSync(CONFIG_PATH)) {
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    console.log(`✅ Config chargée depuis ${CONFIG_PATH}`);
  } catch (err) {
    console.error("❌ Erreur lecture migration-config.json :", err);
    process.exit(1);
  }
} else {
  console.log("ℹ️ migration-config.json non trouvé — utilisation du DEFAULT_BUSINESS_ID env si présent.");
}

// Récupère ID par modèle, sinon DEFAULT_BUSINESS_ID
const getBusinessIdFor = (modelName) => {
  if (config && config.overrides && config.overrides[modelName]) {
    return config.overrides[modelName];
  }
  if (process.env.DEFAULT_BUSINESS_ID) return process.env.DEFAULT_BUSINESS_ID;
  return null;
};

// Liste des modèles à migrer (nom lisible + modèle Mongoose + option : skipIfGlobal)
const MODELS_TO_MIGRATE = [
  { name: "Product", model: Product, skipIfGlobal: false },
  { name: "Category", model: Category, skipIfGlobal: false },
  { name: "Sale", model: Sale, skipIfGlobal: false },
  { name: "Order", model: Order, skipIfGlobal: false },
  { name: "Supplier", model: Supplier, skipIfGlobal: false },
  { name: "Client", model: Client, skipIfGlobal: false },
  { name: "ClientAccount", model: ClientAccount, skipIfGlobal: false },
  { name: "AccountTransaction", model: AccountTransaction, skipIfGlobal: false },
  { name: "History", model: History, skipIfGlobal: false },
  { name: "Payment", model: Payment, skipIfGlobal: false },
//   { name: "Quote", model: Quote, skipIfGlobal: false },
//   { name: "Promotion", model: Promotion, skipIfGlobal: false }, // si tu veux global => retire de la liste
  // Outbox, User, PasswordResetToken sont typiquement globaux → si tu veux les migrer, ajoute-les ici avec un businessId approprié
];

(async () => {
  try {
    console.log("➡️ Connexion à MongoDB...");
    await mongoose.connect(MONGODB_URI, {});

    // Vérifier que les Business IDs fournis existent (facultatif mais recommandé)
    const allBusinessIds = new Set();
    if (config && config.overrides) {
      Object.values(config.overrides).forEach(id => allBusinessIds.add(id));
    }
    if (process.env.DEFAULT_BUSINESS_ID) allBusinessIds.add(process.env.DEFAULT_BUSINESS_ID);

    for (const id of Array.from(allBusinessIds)) {
      if (!id) continue;
      console.log(Business)
      const exists = await Business.exists({ _id: id });
      if (!exists) {
        console.warn(`⚠️ Business id ${id} introuvable dans la collection Business. Vérifie ton config / env.`);
      } else {
        console.log(`✔️ Business ${id} présente.`);
      }
    }

    // Pour chaque modèle : trouver docs sans business et les mettre à jour
    for (const entry of MODELS_TO_MIGRATE) {
      const { name, model } = entry;
      const businessId = getBusinessIdFor(name);

      if (!businessId) {
        console.warn(`⚠️ Aucun businessId configuré pour le modèle ${name}. Ignoré. (tu peux définir DEFAULT_BUSINESS_ID ou migration-config.json overrides)`);
        continue;
      }

      // Count documents sans champ business
      const query = { $or: [ { business: { $exists: false } }, { business: null } ] };
      const toUpdateCount = await model.countDocuments(query);

      console.log(`\n🔁 Modèle ${name} — documents sans business : ${toUpdateCount}`);
      if (toUpdateCount === 0) continue;

      if (DRY_RUN) {
        console.log(`(dry-run) ❗️ Would set ${toUpdateCount} documents of ${name} to business=${businessId}`);
        continue;
      }

      const res = await model.updateMany(query, { $set: { business: new mongoose.Types.ObjectId(businessId) } });
      console.log(`✔️ ${name} : matched ${res.matchedCount || res.n} / modified ${res.modifiedCount || res.nModified}`);
    }

    console.log("\n🎉 Migration terminée. N'oublie pas : une fois vérifié, tu peux rendre le champ `business` requis dans les schémas.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur durant la migration :", err);
    process.exit(1);
  }
})();
