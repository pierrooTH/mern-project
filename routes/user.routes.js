const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');

// auth 
router.post('/register', authController.signUp);


// User DB
// dans la route : http://localhost:5000/user
// on récuperera tous les utilisateurs 
router.get('/', userController.getAllUsers);

// dans la route : http://localhost:5000/user/idDeL'utilisateur
// on récupérera ses infos en particulier sans le password
router.get('/:id', userController.userInfo);
// dans la route : http://localhost:5000/user/idDeL'utilisateur
// on pourra modifier les infos 
// de l'utilisateur en question sans le password
router.put('/:id', userController.updateUser);

module.exports = router;