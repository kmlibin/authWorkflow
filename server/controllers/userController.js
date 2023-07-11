const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { createTokenUser, attachCookiesToResponse, checkPermissions } = require("../utils");

const getAllUsers = async (req, res) => {
  //gets information from auth middleware...so now req.user is something we have access to.
  //route only for admin!
  //.select -password removes from the response
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError("no user with that id");
  }
  checkPermissions(req.user, user._id)
  res.status(StatusCodes.OK).json({ user });
};

//not querying the db, just checking for user
const showCurrentUser = async (req, res) => {
  //gets this from the middleware that runs first in the route
  res.status(StatusCodes.OK).json({ user: req.user });
};

//w user.save()...but at the moment it's hashing the password again, so password gets changed. if you console.log(this.modified path) in the
//user presave hook, you get a list of the paths that have been modified (name, email, or both)
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError();
  }
  //get user and update manually
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;

  await user.save();
  //gotta give a new token if the information is updated
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("please provide both values");
  }
  //find one where the id = req.user.userID. we have access to req.user if token is still valid
  const user = await User.findOne({ _id: req.user.userId });
  //checking that the password is correct, that user is indeed logged in and auth to do this
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("please login");
  }
  user.password = newPassword;
  //remember, user.save invokes the pre('save') hook on userSchema, so it encrypts the passwords
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "successfully changed password" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

//update w/findoneand update
// const updateUser = async (req, res) => {
//   const { name, email } = req.body;
//   if (!name || !email) {
//     throw new CustomError.BadRequestError();
//   }
//   const user = await User.findOneAndUpdate(
//     //find user who matches this _id
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   );
//   //gotta give a new token if the information is updated
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };
