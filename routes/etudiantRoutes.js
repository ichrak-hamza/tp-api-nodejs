const express = require('express');
const router = express.Router();

const {
    getAllEtudiants,
    getEtudiantById,
    createEtudiant,
    updateEtudiant,
    deleteEtudiant,
    getEtudiantsByFiliere
} = require('../controllers/etudiantController');

// Routes /api/etudiants
router.route('/')
    .get(getAllEtudiants)
    .post(createEtudiant);

// IMPORTANT: doit être avant /:id
router.get('/filiere/:filiere', getEtudiantsByFiliere);

// Routes /api/etudiants/:id
router.route('/:id')
    .get(getEtudiantById)
    .put(updateEtudiant)
    .delete(deleteEtudiant);

module.exports = router;
