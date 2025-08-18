import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import { withAuth } from "@/utils/withAuth";
import User from "@/models/User.model";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import PasswordResetToken from "@/models/PasswordResetToken.model";
import History from "@/models/History.model";

import {
  confirmChangePassword,
  sendResetForLoggedUser,
} from "@/services/auth.service";
import { parsePasswordChangeDto } from "@/dtos/auth.dto";

export const GET = withAuth(async (req) => {
  try {
    const session = await getServerSession(authOptions);
    await sendResetForLoggedUser(session);

    return NextResponse.json(
      {
        message: "Un email de confirmation vous a été envoyé.",
        success: true,
        error: false,
      },
      { status: 200 }
    );
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "Erreur! Veuillez réessayer.";
    console.error("GET /auth/send-reset :", error);
    return NextResponse.json(
      { message, success: false, error: true },
      { status }
    );
  }
});

export const PATCH = withAuth(async (req) => {
  try {
    const body = await req.json();
    const dto = parsePasswordChangeDto(body);

    const session = await getServerSession(authOptions);
    if (!session) {
      throw { status: 401, message: "Vous devez être connecté." };
    }

    await confirmChangePassword(session, dto);

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
    console.error("PATCH /auth/change-password :", err);
    return NextResponse.json(
      { message, success: false, error: true },
      { status }
    );
  }
});
