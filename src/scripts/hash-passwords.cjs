const bcrypt = require('bcryptjs');

const passwords = ['Admin@123!', 'Admin@123!', 'Admin@123!'];

passwords.forEach(async (pwd, i) => {
  const hashed = await bcrypt.hash(pwd, 10);
  console.log(`Admin ${i + 1}: ${hashed}`);
});


db.users.insertMany([
  {
    nom: "Dupont",
    prenom: "Jean",
    email: "admin1@quincaillerie.com",
    password: "$2a$10$HASH_GENERE_1_ICI",
    role: "admin",
    status: "actif",
    isDefaultPasswordChanged: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nom: "Martin",
    prenom: "Marie",
    email: "admin2@quincaillerie.com",
    password: "$2a$10$HASH_GENERE_2_ICI",
    role: "admin",
    status: "actif",
    isDefaultPasswordChanged: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nom: "Bernard",
    prenom: "Paul",
    email: "admin3@quincaillerie.com",
    password: "$2a$10$HASH_GENERE_3_ICI",
    role: "admin",
    status: "actif",
    isDefaultPasswordChanged: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])