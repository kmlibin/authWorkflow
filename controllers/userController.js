const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

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
  res.status(StatusCodes.OK).json({ user });
};

//not querying the db, just checking for user
const showCurrentUser = async (req, res) => {
  //gets this from the middleware that runs first in the route
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  res.send("update user");
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("please provide both values");
  } //find one where the id = req.user.userID. we have access to req.user if token is still valid

  const user = await User.findOne({ _id: req.user.userId });
  //checking that the password is correct, that user is indeed logged in and auth to do this
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("please login");
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({msg: 'successfully changed password'})
};


module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
