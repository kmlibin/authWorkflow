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
  const { email, password } = req.body;
  //check for email and password
  if (!email || !password) {
    throw new CustomError.BadRequestError("please provide email and password");
  }
  //check that user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError(
      "user does not exist, please register"
    );
  }
  //check that passwords match
  const passwordIsCorrect = await user.comparePassword(password);
  // console.log(passwordIsCorrect); returns a boolean
  if (!passwordIsCorrect) {
    throw new CustomError.UnauthenticatedError(
      "please provide correct password"
    );
  }

  //attach cookies and send back
  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ tokenUser });
};

const logoutUser = async (req, res) => {
  //remove cookie from browser...token name of cookie we set up earlier in attachCookieToResponse. setting up a new string and this is value
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 1000) //5 seconds...just end on date.now and cookie will be gone
  });
  res.status(StatusCodes.OK).json({msg: 'user logged out'}) //msg just for dev, frontend doesn't really need anything
};

module.exports = { registerUser, loginUser, logoutUser };
