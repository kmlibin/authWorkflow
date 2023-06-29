const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating value"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
      required: [true, "please provide a title"],
    },
    comment: {
      type: String,
      required: [true, "please provide a comment"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);
//makes so user can only post one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

//methods v statics - methods you can call on the instance of user. statics, you call on the schema
//gotta call it from the below hook
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        //or null in this case, see notes.
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  //update - first is the thing to update, second two are props to updatea
  //optional chaining with result because it can be an empty array
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      { averageRating: Math.ceil(result[0]?.averageRating || 0),
       numOfReviews: result[0]?.numOfReviews || 0 }
    );
  } catch (err) {
    console.log(err);
  }
};

//post, will do after the save() is triggered
ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

//will do after .remove() is triggered
ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
