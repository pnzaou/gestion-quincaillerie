import User from "@/models/User.model";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import History from "@/models/History.model";
import Outbox from "@/models/Outbox.model";
import dbConnection from "@/lib/db";
import jwt from "jsonwebtoken";
import PasswordResetToken from "@/models/PasswordResetToken.model";
import { resend } from "@/lib/resend";
import ComfirmResetPassword from "@/components/email/Comfirm-reset-password";

export const createUser = async (dto, sessionData) => {
  await dbConnection();
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const { nom, prenom, email, password, role } = dto;
    const { id: creatorId, name: creatorName } = sessionData.user;

    //Unicité de l'email
    const exists = await User.findOne({ email }).session(mongoSession);
    if (exists) {
      throw { status: 400, message: "Cet email est déjà utilisé." };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Création de l'utilisateur
    const [newUser] = await User.create(
      [{ nom, prenom, email, password: hashedPassword, role }],
      { session: mongoSession }
    );

    // Historique
    await History.create(
      [
        {
          user: creatorId,
          actions: "create",
          resource: "user",
          resourceId: newUser._id,
          description: `${creatorName} a créé un compte pour ${prenom} (${email})`,
        },
      ],
      { session: mongoSession }
    );

    // Outbox (mail de bienvenue)
    await Outbox.create(
      [
        {
          type: "welcome_email",
          payload: {
            to: email, // en prod on envoie à l'utilisateur
            defaultPassword: password,
            loginLink: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
            userFullName: prenom,
          },
        },
      ],
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();
    return;
  } catch (error) {
    await mongoSession.abortTransaction();
    throw error;
  } finally {
    mongoSession.endSession();
  }
};

export const requestForgotPasswordReset = async (dto) => {
  await dbConnection();
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const { email } = dto;

    //recherche utilisateur
    const user = await User.findOne({ email }).session(mongoSession);
    if (!user) {
      throw {
        status: 404,
        message: "Aucun compte utilisateur trouvé avec cet email.",
      };
    }

    //génération du token JWT
    const payload = { userId: user._id, userEmail: email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    //stockage du token en base
    await PasswordResetToken.create(
      [
        {
          userId: user._id,
          token,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          used: false,
        },
      ],
      { session: mongoSession }
    );

    //Envoie du mail
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/forgotten-password-change?token=${token}`;
    const { error } = await resend.emails.send({
      from: "StockIt <onboarding@resend.dev>",
      to: email,
      subject: "Confirmation de la modification de votre mot de passe",
      react: (
        <ComfirmResetPassword
          resetLink={resetLink}
          userFullName={user.prenom}
        />
      ),
    });

    if (error) {
      throw { status: 500, message: "Erreur lors de l'envoi de l'email." };
    }

    await mongoSession.commitTransaction();
  } catch (error) {
    await mongoSession.abortTransaction();
    throw error;
  } finally {
    mongoSession.endSession();
  }
};

export const confirmForgotPasswordReset = async (dto) => {
  await dbConnection();
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const { token, password } = dto;

    // retrouver le token en base
    const dbToken = await PasswordResetToken.findOne({ token }).session(
      mongoSession
    );

    if (
      !dbToken ||
      dbToken.used ||
      dbToken.expiresAt.getTime() < Date.now()
    ) {
      throw {
        status: 400,
        message: "Lien de réinitialisation invalide ou expiré.",
      };
    }

    //Vérificatio du token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw { status: 400, message: "Token invalide." };
    }

    //vérification de l'ID
    if (!mongoose.Types.ObjectId.isValid(payload.userId)) {
      throw { status: 400, message: "Token invalide." };
    }

    // récupération de l'user
    const user = await User.findById(payload.userId).session(mongoSession);
    if (!user) {
      throw {
        status: 400,
        message: "Aucun utilisateur ne correspond à cet ID.",
      };
    }

    // hash du nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save({ session: mongoSession });

    //marquer le token comme utilisé et invalider mes autres
    dbToken.used = true;
    await dbToken.save({ session: mongoSession });

    await PasswordResetToken.updateMany(
      {
        token: { $ne: token },
        userId: payload.userId,
        used: false,
      },
      { $set: { used: true } },
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();
  } catch (error) {
    await mongoSession.abortTransaction();
    throw error;
  } finally {
    mongoSession.endSession();
  }
};
