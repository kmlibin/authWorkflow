const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "please provide product name"],
      maxlength: [100, "cannot be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "please provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "please provide product description"],
      maxlength: [1000, "cannot be more than 1000 characters"],
    },
    image: {
      type: String,
      default: "/uploads/fluff2.png",
    },
    category: {
      type: String,
      required: [true, "please provide category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "please provide a company"],
      //another way to set up enum
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      default: ['#222'],
      required: true,
    },
    featured: {
      type: Boolean,
      required: false,
    },
    freeShipping: {
      type: Boolean,
      required: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  //gives fields createdat and updated at
  { timeStamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
