const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

// recupére tous les utilisateurs et leurs infos (sans le password)
module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
}

// récupérer les infos d'un utilisateur en particulier (selon son ID)
module.exports.userInfo = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID Unknown : ' + req.params.id);
    
    UserModel.findById(req.params.id, (err, docs) => {
        if (!err) res.send(docs);
        else console.log('ID unknown : ' + err)
    }).select('-password');
}

module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID Unknown : ' + req.params.id);

    try {
        await UserModel.findOneAndUpdate(
            {_id: req.params.id},
            {
                $set: {
                    bio: req.body.bio
                },
            },
            {new: true, upsert: true, setDefaultsOnInsert: true},
            (err, docs) => {
                if (!err) return res.send(docs);
                if (err) return res.status(500).send({message: err})
            }
        );
    } catch (err) {
        return res.status(500).json({message: err})
    }
}