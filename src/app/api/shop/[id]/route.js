import dbConnection from "@/lib/db";
import BusinessModel from "@/models/Business.model";
import { withAuthAndRole } from "@/utils/withAuthAndRole";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const PUT = withAuthAndRole(async( req, { params } ) => {
    try {
      await dbConnection();

      const { id } = await params;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            message: "Veuillez fournir un ID valide",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const body = await req.json();
      const { name, phone, email, address, website } = body;

      const business = await BusinessModel.findById(id);
      if (!business) {
        return NextResponse.json(
          {
            message: "Boutique non trouvée",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      // Mettre à jour uniquement si la valeur est une string non vide.
      if (typeof name === "string" && name.trim().length > 0) {
        business.name = name.trim();
      }
      if (typeof phone === "string" && phone.trim().length > 0) {
        business.phone = phone.trim();
      }
      if (typeof email === "string" && email.trim().length > 0) {
        business.email = email.trim();
      }
      if (typeof address === "string") {
        // autorise la chaîne vide si tu veux l'effacer, sinon tester trim().length
        business.address = address.trim() || business.address;
      }
      if (typeof website === "string") {
        business.website = website.trim() || business.website;
      }

      await business.save();

      return NextResponse.json(
        {
          message: "Boutique modifiée avec succès",
          success: true,
          error: false,
          data: business,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur lors de la modification de la boutique: ", error);

      if (error.code === 11000) {
        if (error.keyValue?.name) {
          return NextResponse.json(
            {
              message: `Le nom "${error.keyValue.name}" est déjà utilisé par une autre boutique.`,
              success: false,
              error: true,
            },
            { status: 409 }
          );
        }

        return NextResponse.json(
          {
            message: "Conflit : cette ressource existe déjà.",
            success: false,
            error: true,
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          message: "Une erreur est survenue. Veuillez réessayer.",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
})

export const DELETE = withAuthAndRole(async (req, { params }) => {
  try {
    await dbConnection();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          message: "Veuillez fournir un ID valide",
          success: false,
          error: true,
        },
        { status: 400 }
      );
    }

    const business = await BusinessModel.findById(id);

    if (!business) {
      return NextResponse.json(
        {
          message: "Boutique introuvable",
          success: false,
          error: true,
        },
        { status: 404 }
      );
    }

    await business.deleteOne();

    return NextResponse.json(
      {
        message: "Boutique supprimée avec succès",
        success: true,
        error: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);

    return NextResponse.json(
      {
        message: "Une erreur est survenue lors de la suppression.",
        success: false,
        error: true,
      },
      { status: 500 }
    );
  }
})