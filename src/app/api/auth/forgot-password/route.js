import { NextResponse } from "next/server";

import {
  parsePasswordResetConfirmDto,
  parsePasswordResetRequestDto,
} from "@/dtos/auth.dto";
import {
  confirmPasswordReset,
  requestPasswordReset,
} from "@/services/auth.service";

export const POST = async (req) => {
  try {
    // validation
    const body = await req.json();
    const dto = parsePasswordResetRequestDto(body);

    //Traitement
    await requestPasswordReset(dto);

    return NextResponse.json(
      {
        message: "Un email de confirmation a été envoyé à votre adresse.",
        success: true,
        error: false,
      },
      { status: 200 }
    );
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "Erreur! Veuillez réessayer.";
    console.error("POST /api/auth/forgot-password :", error);
    return NextResponse.json(
      {
        message,
        success: false,
        error: true,
      },
      { status }
    );
  }
};

export const PATCH = async (req) => {
  try {
    const body = await req.json();
    const dto = parsePasswordResetConfirmDto(body);

    await confirmPasswordReset(dto);

    return NextResponse.json(
      {
        message: "Mot de passe modifié avec succès.",
        success: true,
        error: false,
      },
      { status: 200 }
    );
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "Erreur! Veuillez réessayer.";
    console.error("PATCH /api/auth/forgot-password :", error);
    return NextResponse.json(
      {
        message,
        success: false,
        error: true,
      },
      { status }
    );
  }
};
