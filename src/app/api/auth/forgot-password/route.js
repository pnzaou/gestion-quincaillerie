import { NextResponse } from "next/server";

import {
  parseForgotPasswordConfirmDto,
  parseForgotPasswordRequestDto,
} from "@/dtos/auth.dto";
import {
  confirmForgotPasswordReset,
  requestForgotPasswordReset,
} from "@/services/auth.service";

export const POST = async (req) => {
  try {
    // validation
    const body = await req.json();
    const dto = parseForgotPasswordRequestDto(body);

    //Traitement
    await requestForgotPasswordReset(dto);

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
    const dto = parseForgotPasswordConfirmDto(body);

    await confirmForgotPasswordReset(dto);

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
