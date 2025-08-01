import { NextResponse } from "next/server";
import { withAuthAndRole } from "@/utils/withAuthAndRole";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

import { paseCreateUserDto } from "@/dtos/auth.dto";
import { createUser } from "@/services/auth.service";

export const POST = withAuthAndRole(async (req) => {
  try {

    // lecture + validation du body
    const body = await req.json();
    const dto = paseCreateUserDto(body);

    const session = await getServerSession(authOptions);

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
});
