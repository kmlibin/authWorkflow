const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  //attach userID to req.body. we should have req.body from the frontend
  //user is on the model
  //the cookie brings in the jwt, which sets up the req.user, which has a userID prop
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
//public route
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};
//public
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  //find _id that matches product Id
  const product = await Product.findOne({ _id: productId }).populate('reviews');
  if (!product) {
    throw new CustomError.NotFoundError("no product with that id");
  }
  res.status(StatusCodes.OK).json({ product });
};
//restricted routes
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError("no product with that id");
  }
  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new CustomError.NotFoundError("no product with that id");
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "product removed" });
};

const uploadImage = async (req, res) => {
  //access image in req.files
  if (!req.files) {
    throw new CustomError.BadRequestError("no files uploaded");
  }
  //in req.files, we have image prop. check if the mime type is image. productImage must be the same name as what you put in postman
  const productImage = req.files.productImage;
  console.log(req.files)
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("please upload image file");
  }
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "please upload image smaller than 1mb"
    );
  }
  //get current dir name, navto public uploads, use image.name. mv function moves file over there (see uploads folder)
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath)
  res.status(StatusCodes.OK).json({image: `/uploads/${productImage.name}`})
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
