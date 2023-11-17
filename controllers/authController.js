const User = require("../models/User");

const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

module.exports = {
  createUser: async (req, res) => {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      location: req.body.location,
      password: CryptoJs.AES.encrypt(
        req.body.password,
        process.env.SECRET
      ).toString(),
    });

    try {
      await newUser.save();

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(401).json("Wrong credentials, Provide a valid email");
      }
      //!user && res.status(401).json("Wrong credentials, Provide a valid email");

      //Decrypt Password
      const decryptedPassword = CryptoJs.AES.decrypt(
        user.password,
        process.env.SECRET
      );
      const decrptedPass = decryptedPassword.toString(CryptoJs.enc.Utf8);

      //Compare decrypted password with entered password
      if (decrptedPass !== req.body.password) {
        return res.status(401).json("Wrong Password");
      }

      //Create a token
      const userToken = jwt.sign(
        {
          id: user.id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7 Days" }
      );

      //Data we want to exclude from the user
      const { password, __v, createdAt, updatedAt, ...userData } = user._doc;

      res.status(200).json({ ...userData, token: userToken });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
};
