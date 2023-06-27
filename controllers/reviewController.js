const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const checkPermissions = require("../utils");

const createReview = async (req, res) => {
  const { product: productId } = req.body;
  //check if product exists
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new CustomError.NotFoundError("no product with that id");
  }
  //check if user already submitted a review
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "user already submitted a review for this product"
    );
  }
  //attach the user property to the request body
  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  res.send("get all reviews");
};

const getSingleReview = async (req, res) => {
  res.send("get single review");
};

const updateReview = async (req, res) => {
  res.send("update review");
};

const deleteReview = async (req, res) => {
  res.send("delete review");
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
