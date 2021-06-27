const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (id) => {
    // dans la création du token on ajoute l'id de l'utilisateur en paramètre
    // ainsi que la clé secrète située dans le .env pour pouvoir décoder le token
    // et en troisième paramètre une expiration du token
  return jwt.sign({id}, process.env.TOKEN_SECRET, {
    // token valide pour trois jours (en millieseconde)
    // 24*60*60*1000 = 1 journée donc * 3 = 3 journées 
    expiresIn: maxAge
  })
};

module.exports.signUp = async (req, res) => {
  const {pseudo, email, password} = req.body

  try {
    const user = await UserModel.create({pseudo, email, password });
    res.status(201).json({ user: user._id});
  }
  catch(err) {
    const errors = signUpErrors(err);
    res.status(200).send({ errors })
  }
}

module.exports.signIn = async (req, res) => {
    // récupération de l'email et du password de l'user
  const { email, password } = req.body

  // dans le try, quand l'utilisateur rentre son email et son password
  // on lui attribue un token avec son ID 
  // ce qui lui attribue un cookie de connexion grâce au token 
  // si tout s'est bien déroulé, on affiche le statut 200 avec l'id de l'utilisateur 
  // sinon on catch l'erreur 
  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge});
    res.status(200).json({ user: user._id})
  } catch (err){
    res.status(200).json({ message: err });
  }
}

// pour déconnecter l'utilisateur 
// on va tout simplement retirer le cookie qu'on lui a ajouter 
// donc l'utilisateur ne pourra plus présenter de token et sera donc déconnecter
module.exports.logout = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}