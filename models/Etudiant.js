const mongoose = require('mongoose');

const etudiantSchema = new mongoose.Schema({

    nom: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true
    },

    prenom: {
        type: String,
        required: [true, 'Le prénom est obligatoire'],
        trim: true
    },

    email: {
        type: String,
        required: [true, 'L\'email est obligatoire'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
    },

    filiere: {
        type: String,
        required: [true, 'La filière est obligatoire'],
        enum: ['Informatique', 'Génie Civil', 'Électronique', 'Mécanique']
    },

    annee: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    moyenne: {
        type: Number,
        min: 0,
        max: 20,
        default: null
    },

    dateInscription: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Etudiant', etudiantSchema);
