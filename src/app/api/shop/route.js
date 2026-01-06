import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import BusinessModel from "@/models/Business.model";
import { withAuth } from "@/utils/withAuth"; // ✅ Nouveau
import { NextResponse } from "next/server";

// ============================================
// POST - Créer une boutique
// ============================================
export const POST = withAuth(
  async (req, session) => { // ✅ session en paramètre
    try {
      await dbConnection();

      const body = await req.json();
      const { name, phone, email, address, website } = body;

      // ✅ Plus besoin de getServerSession
      const { id } = session.user;

      if (!name || !name.trim() || !phone || !phone.trim() || !email || !email.trim()) {
        return NextResponse.json(
          {
            message: "Veuillez remplir les champs obligatoires.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const existingBusiness = await BusinessModel.findOne({ name: name.trim() });
      if (existingBusiness) {
        return NextResponse.json(
          {
            message: `Une boutique avec le nom ${name} existe déjà.`,
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const newBusiness = await BusinessModel.create({
        name: name.trim(),
        owner: id,
        phone: phone.trim(),
        email: email.trim(),
        address: address?.trim(),
        website: website?.trim(),
      });

      return NextResponse.json(
        {
          message: "Boutique créée avec succès.",
          success: true,
          error: false,
          data: newBusiness,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Erreur lors de la création d'une boutique: ", error);

      let errorMessage = "Erreur! Veuillez réessayer.";

      if (error.code === 11000) {
        errorMessage = "Cette boutique existe déjà.";
      }

      return NextResponse.json(
        {
          message: errorMessage,
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    roles: ["admin"],
  }
);

// ============================================
// GET - Liste des boutiques
// ============================================
export const GET = withAuth(
  async (req, session) => { // ✅ session en paramètre
    try {
      await dbConnection();

      const businesses = await BusinessModel.find({});
      if (!businesses || businesses.length === 0) {
        return NextResponse.json(
          {
            message: "Aucune boutique trouvée.",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          message: "Boutiques récupérées avec succès.",
          success: true,
          error: false,
          data: businesses,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des boutiques: ", error);

      return NextResponse.json(
        {
          message: "Une erreur est survenue. Veuillez réessayer.",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    roles: ["admin", "comptable"], // ✅ Admin ET Comptable
  }
);