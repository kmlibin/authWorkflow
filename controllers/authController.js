//import model
// const User = require("../models/User");

const registerUser = async (req, res) => {
  res.send("register user");
};

const loginUser = async (req, res) => {
  res.send("login user");
};

const logoutUser = async (req, res) => {
  res.send("logout user");
};


module.exports = {registerUser, loginUser, logoutUser};