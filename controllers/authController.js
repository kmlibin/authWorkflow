//import model
const User = require("../models/User");
//status codes & errors
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const registerUser = async (req, res) => {
  //check for duplicate email
  const { email } = req.body;
  const checkIfExists = await User.findOne({ email });
  if (checkIfExists) {
    throw new CustomError.BadRequestError("email already in use");
  }
  //create a new user
  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({
    user,
  });
};

const loginUser = async (req, res) => {
  res.send("login user");
};

const logoutUser = async (req, res) => {
  res.send("logout user");
};

module.exports = { registerUser, loginUser, logoutUser };
