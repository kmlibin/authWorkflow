//import model
const User = require("../models/User");
//errors
const CustomError = require("../errors");
//utils
const { attachCookiesToResponse } = require("../utils");
//libraries
const { StatusCodes } = require("http-status-codes");

const registerUser = async (req, res) => {
  const { email, name, password } = req.body;

  //check for duplicate email
  const checkIfExists = await User.findOne({ email });
  if (checkIfExists) {
    throw new CustomError.BadRequestError("email already in use");
  }
  //first registered user is admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  //create a new user w name/email/password..role can't be manipulated b/c checked above. or delete above, only create w/ name, email, pass
  const user = await User.create({ name, email, password, role });
  //create a token user (what you wantto send back) and token for the user
  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  //token & cookie are created in this util func. this func specifically attaches cookie to the response.
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({
    user: tokenUser,
  });
};

const loginUser = async (req, res) => {
  res.send("login user");
};

const logoutUser = async (req, res) => {
  res.send("logout user");
};

module.exports = { registerUser, loginUser, logoutUser };
