const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
require('dotenv').config({path: './config/.env'});
// connexion a la BD de MongoDB dans le fichier db.js dans le dossier config
require('./config/db');
const {checkUser, requireAuth} = require('./middleware/auth.middleware');
// utilisation de express
const app = express();

// utilisation de req.body (du bodyParser avec express)
app.use(express.json());
app.use(cookieParser());

// jwt
    // à chaque requête, il y aura un check de l'utilisateur 
    // pour savoir si l'utilisateur a bien un token avec son ID
    // sécurisation de la connexion de l'utilisateur 
app.get('*', checkUser);
app.get('/jwtid', requireAuth, (req,res) => {
    res.status(200).send(res.locals.user._id);
})

// routes
app.use('/user', userRoutes);
app.use('/post', postRoutes);

// lancement du serveur sur port 5000
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})

