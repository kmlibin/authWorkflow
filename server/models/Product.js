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
      default: ["#222"],
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
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  //timestampsgives fields createdat and updated at
  //the other fields so the model accepts virtuals
  { timeStamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//will also populate reviews assoc with product. but why can't just use populate and connect the models?
ProductSchema.virtual("reviews", {
  //points to a model
  ref: "Review",
  //connection between the two...reviews share the productId, in this model, it's called _id
  localField: "_id",
  //field in the review that matches the prop in review
  foreignField: "product",
  justOne: false,
});

//will remove the review when product is deleted. in controller, .remove triggers the pre hook
ProductSchema.pre("remove", async function (next) {
  //can pass in a different model, so can access more than just this
  //delete many, what reviews do you want to remove? product is the property on the review model that references what we want to remove
  await this.model("Review").deleteMany({ product: this._id });
});
module.exports = mongoose.model("Product", ProductSchema);
