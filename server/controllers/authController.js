//import model
const User = require("../models/User");
const Token = require("../models/Token");
//errors
const CustomError = require("../errors");
//utils
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../utils");
//libraries
const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");

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

  //set up verification token...so when i'm creating user, pass this in. you want unique token for each user.
  //this (randomBytes) is a buffer, we want to turn it into a string
  const verificationToken = crypto.randomBytes(40).toString("hex");
  //create a new user w name/email/password..role can't be manipulated b/c checked above. or delete above, only create w/ name, email, pass
  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  //origin, where user navigates when they click on the link
  const origin = "http://localhost:3000";

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  //just for postman - we will send an email back, not verification token
  res.status(StatusCodes.CREATED).json({
    msg: "success, verify email pls",
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthorizedError("verification failed");
  }
  if (verificationToken !== user.verificationToken) {
    throw new CustomError.UnauthorizedError("verification denied");
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "email verified" });
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
  //check if user has verified email
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("please verify email");
  }
  //attach cookies and send back
  const tokenUser = createTokenUser(user);
  //create refresh token
  let refreshToken = "";

  //check for existing token in DB
  const existingToken = await Token.findOne({ user: user._id });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("invalid credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }
  //if no refresh token
  //want to set up two cookies, the access one and the refresh one
  //set up refresh to send to attach cookies, that func attaches both cookies. refresh lives on the server to request another access token
  refreshToken = crypto.randomBytes(40).toString("hex");

  //add to Token model
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };
  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ tokenUser });
};

const logoutUser = async (req, res) => {
  //remove token
  await Token.findOneAndDelete({ user: req.user.userId });
  //remove both cookies from browser...token name of cookie we set up earlier in attachCookieToResponse. setting up a new string and this is value (logout)
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out" }); //msg just for dev, frontend doesn't really need anything
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError("Please provide valid email");
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");
    // send email
    const origin = "http://localhost:3000";
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
    //ADD these to the user
    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: "Please check your email for reset password link" });
};
const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.send("reset password");
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
