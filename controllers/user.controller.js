const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

// recupére tous les utilisateurs et leurs infos (sans le password)
module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
}

// récupérer les infos d'un utilisateur en particulier (selon son ID)
module.exports.userInfo = (req, res) => {
    // si l'ID de l'utilisateur n'est pas connu 
    // on retourne une erreur en satut 400 qui affiche un message 
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID Unknown : ' + req.params.id);

    UserModel.findById(req.params.id, (err, docs) => {
        if (!err) res.send(docs);
        else console.log('ID unknown : ' + err)
    }).select('-password');
}

module.exports.updateUser = async (req, res) => {
    // si l'ID de l'utilisateur n'est pas connu 
    // on retourne une erreur en satut 400 qui affiche un message 
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID Unknown : ' + req.params.id);

    try {
        // findOneAndUpdate = trouve l'élément grâce à l'ID et mets le à jour
        await UserModel.findOneAndUpdate(
            // donc premier élément :
            // récupération de l'id
            { _id: req.params.id },
            // deuxième élément c'est ce qu'on modifie :
            // on set la bio, c'est à dire qu'on veut modifier la bio
            {
                $set: {
                    bio: req.body.bio
                },
            },
            // paramètre à mettre obligatoirement quand on fait un put
            { new: true, upsert: true, setDefaultsOnInsert: true },

            (err, docs) => {
                // si il n'y a pas d'erreur, cela envoie les docs donc les données
                if (!err) return res.send(docs);
                // si il y a une erreur, cela envoie un statut 500 qui retourne un message d'erreur
                if (err) return res.status(500).send({ message: err })
            }
        );
        // et si le try à échoué on retourne une erreur en json 
    } catch (err) {
        return res.status(500).json({ message: err })
    }
}

module.exports.deleteUser = async (req, res) => {
    // si l'ID de l'utilisateur n'est pas connu 
    // on retourne une erreur en satut 400 qui affiche un message 
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID Unknown : ' + req.params.id);

    // on essaye de supprimer l'utilisateur 
    try {
        // on supprime l'utilisateur en fonction de son ID 
        // en cas de succès on affiche un statut 200 avec un message en json de succès 
        await UserModel.remove({ _id: req.params.id }).exec();
        res.status(200).json({ message: "Successfully deleted. " });

        // si le try n'a pas fonctionné on recupère l'erreur en paramètre 
        // et on l'a retourne dans un statut 500 (en json)
    } catch (err) {
        return res.status(500).json({ message: err });
    }
}

module.exports.follow = async (req, res) => {
    // on vérifie si l'ID de l'utilisateur existe ou on vérifie
    // si l'ID de l'utilisateur qu'on veut follow existe
    // si les ID sont inconnus
    // on retourne une erreur en satut 400 qui affiche un message d'erreur 
    if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToFollow))
        return res.status(400).send('ID Unknown : ' + req.params.id);

    try {
        // ajout d'une liste de followers pour ceux qui ont follow un user
        await UserModel.findByIdAndUpdate(
            req.params.id,
            // $addToSet = rajoute celui qu'on a follow grâce à son ID
            // dans addToSet, on a prit l'id de l'utilisateur en question
            // et on lui rajoute l'Id de l'utilisateur qui suit grâce au req.body.idToFollow
            { $addToSet: { following: req.body.idToFollow } },
            { new: true, upsert: true },
            (err, docs) => {
                if (!err) res.status(201).json(docs);
                else return res.status(400).json(err);
            }
        );
        // ajout d'une liste de following pour ceux qui ont eu un follow
        await UserModel.findByIdAndUpdate(
            // ici on récupére donc l'ID de l'user qui a follow 
            req.body.idToFollow,
            { $addToSet: { followers: req.params.id } },
            { new: true, upsert: true },
            (err, docs) => {
                // on ne peut pas mettre deux res.status 
                //  if (!err) res.status(201).json(docs);
                if (err) return res.status(400).json(err);
            }
        )

    } catch (err) {
        return res.status(500).json({ message: err });
    }
}

module.exports.unfollow = async (req, res) => {
    if (
      !ObjectID.isValid(req.params.id) ||
      !ObjectID.isValid(req.body.idToUnfollow)
    )
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      await UserModel.findByIdAndUpdate(
        req.params.id,
        // $pull = pull permet de retirer un élément
        // on retire donc l'ID de la personne a unfollow pour qu'elle ne soit plus dans la liste des followers de l'utilisateur en question
        { $pull: { following: req.body.idToUnfollow } },
        { new: true, upsert: true },
        (err, docs) => {
          if (!err) res.status(201).json(docs);
          else return res.status(400).jsos(err);
        }
      );
      // remove to following list
      await UserModel.findByIdAndUpdate(
        req.body.idToUnfollow,
        { $pull: { followers: req.params.id } },
        { new: true, upsert: true },
        (err, docs) => {
          // if (!err) res.status(201).json(docs);
          if (err) return res.status(400).jsos(err);
        }
      );
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  };