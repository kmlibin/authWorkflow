const Order = require("../models/Order");
const Product = require("../models/Product");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

const getAllOrders = async (req, res) => {
  res.send("get all orders");
};

const getSingleOrder = async (req, res) => {
  res.send("get single order");
};

const getCurrentUserOrders = async (req, res) => {
  res.send("get current user order");
};

//from frontend, we expect product tax, shipping fee, an array of items
const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  //check that values are provided
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No cart items provided");
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError("provide tax and/or shipping fee");
  }
  //for/of allows us to run await inside of loop.
  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError("item not found with that id");
    }
    const { name, price, image, _id } = dbProduct;

    //now set up single cart item schema
    const singleOrderItem = {
      //amount comes in from frontend
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    //add item to order...remember, we are still in a loop so it does this for each item
    orderItems = [...orderItems, singleOrderItem]
    //calculate subtotal
    subtotal += item.amount * price
  }
  console.log(orderItems, subtotal)
  res.send("create order");
};

const updateOrder = async (req, res) => {
  res.send("update order");
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
