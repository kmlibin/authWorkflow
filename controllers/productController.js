const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const createProduct = async (req, res) => {
  //attach userID to req.body. we should have req.body from the frontend
  //user is on the model
  //the cookie brings in the jwt, which sets up the req.user, which has a userID prop
  req.body.user = req.user.userId
  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json({ product });

};

const getAllProducts = async (req, res) => {
  res.send("get all products");
};

const getSingleProduct = async (req, res) => {
  res.send("get single product");
};

const updateProduct = async (req, res) => {
  res.send("update product");
};

const deleteProduct = async (req, res) => {
  res.send("delete product");
};

const uploadImage = async (req, res) => {
  res.send("upload image");
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
