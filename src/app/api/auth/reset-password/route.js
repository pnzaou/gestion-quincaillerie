import { NextResponse } from "next/server";
import dbConnection from "@/lib/db";
import User from "@/models/User.model";
import bcrypt from "bcryptjs";
import { withAuth } from "@/utils/withAuth"; // ✅ Import

const mdpRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/

async function handler(request, session) { // ✅ Reçoit la session
  try {
    await dbConnection();

    const { oldPassword, newPassword, confirmNewPassword } = await request.json();

    // ✅ userId vient de la session (plus sécurisé)
    const userId = session.user.id;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: "Données manquantes" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { message: "Les deux mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }

    if(!mdpRegex.test(newPassword)) {
      return NextResponse.json(
        { message: "Veuillez saisir un nouveau mot de passe valid" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Ancien mot de passe incorrect" },
        { status: 400 },
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour l'utilisateur
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Mot de passe changé avec succès",
    });
  } catch (error) {
    console.error("Erreur changement mot de passe:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// ✅ Exporte avec withAuth (vérifie juste l'authentification)
export const PATCH = withAuth(handler);