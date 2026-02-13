// Importer mongoose pour se connecter à MongoDB
const mongoose = require('mongoose');

// Fonction asynchrone de connexion à la base de données
const connectDB = async () => {
    try {
        // Tenter la connexion avec l'URI défini dans .env
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        // Si la connexion réussit, afficher un message
        console.log(`? MongoDB connecté:  ${conn.connection.host}`);
    } catch (error) {
        // Si la connexion échoue, afficher l'erreur et arrêter le programme
        console. error(`? Erreur de connexion MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// Exporter la fonction pour l'utiliser ailleurs
module.exports = connectDB;