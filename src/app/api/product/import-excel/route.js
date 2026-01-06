import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import History from "@/models/History.model";
import Product from "@/models/Product.model";
import { mapRowData, productAliasMapping } from "@/utils/mapping";
import { withAuth } from "@/utils/withAuth"; // ✅ Changé
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// ============================================
// POST - Importer produits depuis Excel
// ============================================
export const POST = withAuth(
  async (req, session) => { // ✅ session en paramètre
    await dbConnection();
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      // ✅ Plus besoin de getServerSession
      const { name, id } = session.user;
      const data = await req.formData();
      const file = data.get("file");
      const businessId = data.get("businessId");

      if (!businessId) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "ID de la boutique manquant.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      if (!file) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Aucun fichier reçu.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const businessObjectId = new mongoose.Types.ObjectId(businessId);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet);

      const inserted = [];
      const doublons = [];

      for (const rawRow of rawRows) {
        const mapped = mapRowData(rawRow, productAliasMapping);
        const nom = mapped.nom?.trim();
        const prixAchat = mapped.prixAchat || mapped.prixAchatEnGros; // Support ancien format
        const prixVente = mapped.prixVente || mapped.prixVenteEnGros; // Support ancien format
        const QteInitial = mapped.QteInitial || 0;
        const QteStock = mapped.QteStock || 0;
        const QteAlerte = mapped.QteAlerte || 0;
        const reference = mapped.reference?.trim() || "";
        const description = mapped.description?.trim() || "";

        if (
          !nom ||
          prixAchat === undefined ||
          prixVente === undefined ||
          QteInitial === undefined ||
          QteStock === undefined ||
          QteAlerte === undefined
        )
          continue;

        // Vérifier si existe dans CETTE boutique
        const existingProd = await Product.findOne({
          nom,
          business: businessObjectId,
        }).session(mongoSession);

        if (existingProd) {
          doublons.push(nom);
          continue;
        }

        const statut = QteStock > 0 ? "En stock" : "En rupture";

        const [newProd] = await Product.create(
          [
            {
              nom,
              prixAchat,
              prixVente,
              QteInitial,
              QteStock,
              QteAlerte,
              reference,
              description,
              statut,
              business: businessObjectId,
            },
          ],
          { session: mongoSession }
        );
        inserted.push(newProd);
      }

      await History.create(
        [
          {
            user: id,
            actions: "create",
            resource: "product",
            description: `${name} a importé ${inserted.length} articles depuis Excel.`,
            business: businessObjectId,
          },
        ],
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      let message = "";

      if (inserted.length === 0 && doublons.length > 0) {
        message = "Aucun article ajouté : ils existent déjà tous.";
      } else if (inserted.length > 0 && doublons.length > 0) {
        message = `${inserted.length} article(s) ajouté(s). ${doublons.length} déjà existant(s) ignoré(s).`;
      } else if (inserted.length > 0 && doublons.length === 0) {
        message = "Tous les articles ont été ajoutés avec succès.";
      } else {
        message = "Aucune donnée valide trouvée dans le fichier.";
      }

      return NextResponse.json(
        {
          message,
          success: true,
          error: false,
          créés: inserted.length,
          doublons,
        },
        { status: 201 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      console.error("Erreur lors de l'importation des articles: ", error);

      return NextResponse.json(
        {
          message: "Erreur! Veuillez réessayer.",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.PRODUCTS, // ✅ Flexible
    action: ACTIONS.IMPORT,
  }
);