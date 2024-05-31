const user = require("../Model/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      res.status(406).json("Account already exists, Please Login");
    } else {
      // encrpt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const newUser = new user({
        userName,
        email,
        password: hashedPassword,
      });
      await newUser.save();
      console.log(`${userName},${email},${password}`);
      res.status(200).json(newUser);
    }
  } catch (err) {
    res.status(400).json(`register api failed, Error:${err}`);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await user.findOne({ email });
    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET_KEY
    );
    if (!existingUser) {
      return res.status(404).json("User Not Found");
    }
    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      return res.status(400).json("Incorrect Password");
    }
    res.status(200).json({ existingUser, token });
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal Server Error");
  }
};

exports.googleLogin = async (req, res) => {
  const { email, userName, profilePic } = req.body;
  try {
    let existingUser = await user.findOne({ email });

    if (existingUser) {
      const token = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET_KEY
      );
      res.status(200).json({ user: existingUser, token });
    } else {
      const newUser = new user({
        userName,
        email,
        password: "",
        profilePic,
      });
      await newUser.save();
      const token = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET_KEY
      );
      res.status(200).json({ user: newUser, token });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal Server Error");
  }
};

exports.dummy = async (req, res) => {
  res.status(500).json("You have accesed dummy api");
};
