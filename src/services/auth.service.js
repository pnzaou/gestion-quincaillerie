import User from "@/models/User.model";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import History from "@/models/History.model";
import Outbox from "@/models/Outbox.model";
import dbConnection from "@/lib/db";

export const createUser = async (dto, sessionData) => {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    await dbConnection();

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
