const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        pseudo: {
            type: String,
            // obligatoire 
            required: true,
            minLength: 3,
            maxLength: 55,
            unique: true,
            // espacements sans caractère retirés 
            trim: true
        },
        email: {
          type: String,
          required: true,
          validate: [isEmail],
          lowercase: true,
          unique: true,
          trim: true,
        },
        password: {
          type: String,
          required: true,
          max: 1024,
          minlength: 6
        },
        picture: {
          type: String,
          default: "./uploads/profil/random-user.png"
        },
        bio :{
          type: String,
          max: 1024,
        },
        followers: {
          type: [String]
        },
        following: {
          type: [String]
        },
        likes: {
          type: [String]
        }
    }, 
    {
        timestamps: true
    }
)

// crypter le password grâce à la librairie
// bcrypt 
userSchema.pre("save", async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// quand on va tenter de se loger, on va récupérer l'email et le password 
// et bcrypt va comparer les deux cryptage entre le vrai password et celui crypter 
// et va nous dire si c'est les mêmes
// (pas de fonction fléchée pour le scope : afin de récupéré le this.findOne({email})

userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if (user) {   
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;