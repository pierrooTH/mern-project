const express = require('express');
require('dotenv').config({path: './config/.env'});
// connexion a la BD de MongoDB dans le fichier db.js dans le dossier config
require('./config/db');
const userRoutes = require('./routes/user.routes');

// utilisation de express
const app = express();
// utilisation de req.body (du bodyParser avec express)
app.use(express.json())


// routes
app.use('/user', userRoutes);

// lancement du serveur sur port 5000
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})

