const Order = require("../models/Order");
const Product = require("../models/Product");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  //find order with id in params
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError("no order with that id");
  }
  //check access
  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  res.send("get current user order");
};

//fake stripe funtion
const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "randomValue";
  return { client_secret, amount };
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
    orderItems = [...orderItems, singleOrderItem];
    //calculate subtotal
    subtotal += item.amount * price;
  }
  //calculate total
  const total = tax + shippingFee + subtotal;
  //communicate with stripe to get client secret (fake function)
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    curreny: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
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
