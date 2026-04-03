const Etudiant = require("../models/Etudiant");
const mongoose = require("mongoose");

// ============================================
// CREATE
// ============================================
exports.createEtudiant = async (req, res) => {
  try {
    const { nom, prenom, moyenne } = req.body;

    if (!nom || !prenom) {
      return res.status(400).json({ message: "Nom et prénom obligatoires" });
    }

    if (moyenne === undefined || typeof moyenne !== "number") {
      return res.status(400).json({ message: "Moyenne invalide" });
    }

    if (moyenne < 0 || moyenne > 20) {
      return res.status(400).json({ message: "Moyenne doit être entre 0 et 20" });
    }

    // ✅ SOLUTION ICI
    const etudiant = new Etudiant({
      nom,
      prenom,
      moyenne,
      email: req.body.email || "test@test.com",
      filiere: req.body.filiere || "Informatique",
      annee: req.body.annee || 1,
      actif: true,
    });

    await etudiant.save();

    res.status(201).json(etudiant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================
// READ ALL
// ============================================
exports.getAllEtudiants = async (req, res) => {
  try {
    const etudiants = await Etudiant.find();
    res.status(200).json(etudiants); // ✅ tableau direct
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================================
// READ ONE
// ============================================
exports.getEtudiantById = async (req, res) => {
  try {
    // Vérifier ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID invalide",
      });
    }

    const etudiant = await Etudiant.findById(req.params.id);

    if (!etudiant) {
      return res.status(404).json({
        success: false,
        message: "Étudiant non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: etudiant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// ============================================
// GET INACTIFS
// ============================================
exports.getEtudiantsInactifs = async (req, res) => {
  try {
    const etudiants = await Etudiant.find({ actif: false });

    res.status(200).json({
      success: true,
      count: etudiants.length,
      data: etudiants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE
// ============================================
exports.updateEtudiant = async (req, res) => {
  try {
    // Vérifier ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID invalide",
      });
    }

    const etudiant = await Etudiant.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!etudiant) {
      return res.status(404).json({
        success: false,
        message: "Étudiant non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      message: "Étudiant mis à jour avec succès",
      data: etudiant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur de mise à jour",
      error: error.message,
    });
  }
};

// ============================================
// DELETE (soft delete)
// ============================================
exports.deleteEtudiant = async (req, res) => {
  try {
    // Vérifier ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID invalide",
      });
    }

    const etudiant = await Etudiant.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { new: true }
    );

    if (!etudiant) {
      return res.status(404).json({
        success: false,
        message: "Étudiant non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      message: "Étudiant désactivé avec succès",
      data: etudiant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// ============================================
// SEARCH SIMPLE
// ============================================
exports.searchEtudiants = async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un terme de recherche",
      });
    }

    const regex = new RegExp(q, "i");

    const etudiants = await Etudiant.find({
      $or: [{ nom: regex }, { prenom: regex }],
    });

    res.status(200).json({
      success: true,
      count: etudiants.length,
      query: q,
      data: etudiants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// ============================================
// SEARCH BY FILIERE
// ============================================
exports.getEtudiantsByFiliere = async (req, res) => {
  try {
    const etudiants = await Etudiant.find({
      filiere: req.params.filiere,
    });

    res.status(200).json({
      success: true,
      count: etudiants.length,
      filiere: req.params.filiere,
      data: etudiants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// ============================================
// ADVANCED SEARCH
// ============================================
exports.advancedSearch = async (req, res) => {
  try {
    const { nom, filiere, anneeMin, anneeMax, moyenneMin } = req.query;

    let filter = { actif: true };

    if (nom) filter.nom = new RegExp(nom, "i");
    if (filiere) filter.filiere = filiere;

    if (anneeMin || anneeMax) {
      filter.annee = {};
      if (anneeMin) filter.annee.$gte = parseInt(anneeMin);
      if (anneeMax) filter.annee.$lte = parseInt(anneeMax);
    }

    if (moyenneMin) {
      filter.moyenne = { $gte: parseFloat(moyenneMin) };
    }

    const etudiants = await Etudiant.find(filter);

    res.status(200).json({
      success: true,
      count: etudiants.length,
      filters: req.query,
      data: etudiants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};