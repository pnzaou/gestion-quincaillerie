const mdpRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const roles = ["admin", "gerant", "comptable"];

export const paseCreateUserDto = (body) => {
  const { nom, prenom, email, password, role } = body;

  if (![nom, prenom, email, password, role].every(Boolean)) {
    throw { status: 400, message: "Tous les champs sont obligatoires." };
  }

  if (!mdpRegex.test(password)) {
    throw {
      status: 400,
      message:
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
    };
  }

  if (!emailRegex.test(email)) {
    throw { status: 400, message: "Format de l'email invalide." };
  }
  if (!roles.includes(role)) {
    throw { status: 400, message: "Rôle invalide." };
  }

  return { nom, prenom, email, password, role };
};

export function parseForgotPasswordRequestDto(body) {
  const { email } = body;
  if (!email) {
    throw { status: 400, message: "Veuillez renseigner votre email." };
  }
  if (!emailRegex.test(email)) {
    throw { status: 400, message: "Format de l'email invalide." };
  }
  return { email };
}

export function parseForgotPasswordConfirmDto(body) {
  const { token, password, confirmPassword } = body;

  if (!token) {
    throw { status: 400, message: "Veuillez fournir un token." };
  }
  if (!password || !confirmPassword) {
    throw { status: 400, message: "Tous les champs sont obligatoires." };
  }
  if (password !== confirmPassword) {
    throw { status: 400, message: "Les deux mots de passe sont différents." };
  }
  if (!mdpRegex.test(password)) {
    throw {
      status: 400,
      message:
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
    };
  }

  return { token, password };
}

export function parsePasswordChangeDto(body) {
  const { token,  oldPassword, newPassword, confirmPassword } = body;

  if (!token) {
    throw { status: 400, message: "Veuillez fournir un token." };
  }

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw { status: 400, message: "Tous les champs sont obligatoires." };
  }

  if (newPassword !== confirmPassword) {
    throw { status: 400, message: "Les deux mots de passe sont différents." };
  }

  if (!mdpRegex.test(newPassword)) {
    throw {
      status: 400,
      message:
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
    };
  }

  return { token, oldPassword, newPassword };
}