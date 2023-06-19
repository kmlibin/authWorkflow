const express = require("express");
const router = express.Router();

//middleware
const {authenticateUser} = require('../middleware/authentication')

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

router.route("/").get(authenticateUser, getAllUsers);
//order is important - must go before :id, or else will confuse with an :id
router.route("/showMe").get(showCurrentUser);
router.route("/updateUser").patch(updateUser);
router.route("/updateUserPassword").patch(updateUserPassword);
router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
