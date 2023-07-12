const mongoose = require("mongoose");

//libraries
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide name"],
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
  },
  password: {
    type: String,
    required: [true, "please provide password"],
    minLength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  verifiationToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Date,
  },
});

//before (pre) we save the document, we want to has the password
UserSchema.pre("save", async function () {
  // console.log(this.modifiedPaths());
  // console.log(this.modifiedPaths('email')) returns boolean t if email is modified, f if not
  //if we are modifiying the password, proceed. if not, return
  if (!this.isModified("password")) return;
  //this points back to the user
  //salt is # of rounds
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//function to compare the hashed passwords...only way is to take stored password, hash it, and compare
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  //will return true if they match
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
