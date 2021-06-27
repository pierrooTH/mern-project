const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

// middleware qui permet de contrôler les requêtes utilisateurs 
// permet de valider que la personne est bien connecté 
// et bien identifié sous son token unique avec une clé secrète
module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        res.cookie("jwt", "", { maxAge: 1 });
        next();
      } else {
        let user = await UserModel.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

// middleware permettant de s'authentifier pour la toute première fois sur l'application
module.exports.requireAuth = (req, res, next) => {
    // récupération du token
    const token = req.cookies.jwt;
    // si jamais on a un token 
    // alors on lance une vérification avec le JWT
    // on lui passe notre clé secrète grâce à la variable d'environnement 
    // et si il y a une erreur on l'a log 
    // sinon on déclenchera le decodedToken
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
          if (err) {
            console.log(err);
          } else {
            console.log(decodedToken.id);
            next();
          }
        });
    } else {
        console.log('No token')
    }
};