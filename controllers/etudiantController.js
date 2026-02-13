const Etudiant = require("../models/Etudiant");

// ============================================
// CREATE
// ============================================
exports.createEtudiant = async (req, res) => {
  try {
    const { nom, prenom, email, filiere, annee, moyenne } = req.body;

    // V�rifier doublons
    const etudiantExist = await Etudiant.findOne({
      nom: nom.trim(),
      prenom: prenom.trim(),
    });
    if (etudiantExist) {
      return res.status(400).json({
        success: false,
        message: "Un �tudiant avec ce nom et pr�nom existe d�j�",
      });
    }

    // Cr�er l'�tudiant
    const etudiant = await Etudiant.create({
      nom,
      prenom,
      email,
      filiere,
      annee,
      moyenne,
    });

    res.status(201).json({
      success: true,
      message: "�tudiant cr�� avec succ�s",
      data: etudiant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Donn�es invalides",
      error: error.message,
    });
  }
};

// ============================================
// READ ALL
// ============================================
exports.getAllEtudiants = async (req, res) => {
  try {
    const etudiants = await Etudiant.find({ actif: true });

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
// READ ONE
// ============================================
exports.getEtudiantById = async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.params.id);
    if (!etudiant) {
      return res.status(404).json({
        success: false,
        message: "�tudiant non trouv�",
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
    const etudiant = await Etudiant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!etudiant) {
      return res.status(404).json({
        success: false,
        message: "�tudiant non trouv�",
      });
    }

    res.status(200).json({
      success: true,
      message: "�tudiant mis � jour avec succ�s",
      data: etudiant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur de mise � jour",
      error: error.message,
    });
  }
};

// ============================================
// DELETE
// ============================================
exports.deleteEtudiant = async (req, res) => {
  try {
    const etudiant = await Etudiant.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { new: true }
    );

    if (!etudiant) {
      return res.status(404).json({
        success: false,
        message: "�tudiant non trouv�",
      });
    }

    res.status(200).json({
      success: true,
      message: "�tudiant d�sactiv� avec succ�s",
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
// SEARCH BY FILIERE (BONUS)
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
exports.searchEtudiants = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un terme de recherche",
      });
    }

    const regex = new RegExp(q, "i"); // insensible � la casse

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

// Recherche avancée avec filtres multiples
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
    if (moyenneMin) filter.moyenne = { $gte: parseFloat(moyenneMin) };

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
