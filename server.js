// ============================================
// IMPORTS
// ============================================
<<<<<<< HEAD
// Branche A : Serveur Express principal
=======
// Branche B : Application Express
>>>>>>> branche-b
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

// ============================================
// CONFIGURATION
// ============================================

// Charger les variables d'environnement depuis . env
dotenv.config();

// Connexion � la base de donn�es MongoDB
connectDB();

// Cr�er l'application Express
const app = express();

// ============================================
// MIDDLEWARES
// ============================================

// Middleware pour parser le JSON dans les requ�tes
// Sans cela, req.body serait undefined
app.use(express.json());

// ============================================
// ROUTES
// ============================================

// Route d'accueil - pour tester que le serveur fonctionne
app.get("/", (req, res) => {
  res.json({
    message: "?? Bienvenue sur l'API de gestion des �tudiants! ",
    version: "1.0.0",
    endpoints: {
      listeEtudiants: "GET /api/etudiants",
      creerEtudiant: "POST /api/etudiants",
      voirEtudiant: "GET /api/etudiants/:id",
      modifierEtudiant: "PUT /api/etudiants/:id",
      supprimerEtudiant: "DELETE /api/etudiants/: id",
      parFiliere: "GET /api/etudiants/filiere/: filiere",
    },
  });
});

// Monter les routes des �tudiants sur /api/etudiants
app.use("/api/etudiants", require("./routes/etudiantRoutes"));

// ============================================
// GESTION DES ERREURS
// ============================================

// Route 404 pour les URLs non trouv�es
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouv�e`,
  });
});

// ============================================
// D�MARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
    +--------------------------------------------+
    �   ?? Serveur d�marr� avec succ�s!          �
    �--------------------------------------------�
    �   ?? URL: http://localhost:${PORT}             �
    �   ?? API: http://localhost:${PORT}/api/etudiants�
    +--------------------------------------------+
    `);
});
