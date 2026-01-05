import { NextResponse } from "next/server";
import { withAuth } from "@/utils/withAuth"; 

import { paseCreateUserDto } from "@/dtos/auth.dto";
import { createUser } from "@/services/auth.service";

export const POST = withAuth(
  async (req, session) => { // ✅ session en paramètre
    try {
      // Lecture + validation du body
      const body = await req.json();
      const dto = paseCreateUserDto(body);

      // ✅ Plus besoin de getServerSession, on a déjà session
      await createUser(dto, session);

      return NextResponse.json(
        {
          message: "Utilisateur créé avec succès.",
          success: true,
          error: false,
        },
        { status: 201 }
      );
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || "Erreur! Veuillez réessayer.";
      console.error("POST /api/register :", error);
      return NextResponse.json(
        {
          message,
          success: false,
          error: true,
        },
        { status }
      );
    }
  },
  {
    roles: ["admin"], // ✅ ADMIN UNIQUEMENT
  }
);