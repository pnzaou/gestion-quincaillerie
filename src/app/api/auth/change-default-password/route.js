import { NextResponse } from "next/server";
import dbConnection from "@/lib/db";
import User from "@/models/User.model";
import bcrypt from "bcryptjs";
import { withAuth } from "@/utils/withAuth"; // ✅ Import

async function handler(request, session) { // ✅ Reçoit la session
  try {
    await dbConnection();

    const { currentPassword, newPassword } = await request.json();

    // ✅ userId vient de la session (plus sécurisé)
    const userId = session.user.id;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Données manquantes" },
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
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Mot de passe actuel incorrect" },
        { status: 401 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour l'utilisateur
    user.password = hashedPassword;
    user.isDefaultPasswordChanged = true;
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
export const POST = withAuth(handler);