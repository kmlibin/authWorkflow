const express = require("express");
const router = express.Router();

//middleware
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

//adding arguments is an issue of invoking - if we do authPermissions('user', 'admin'), it invokes right away, it's not just a reference. 
//it's like onClick handlers in React, we don't want to immediately invoke it. so, now we want to return a function in authPermissions
router.route("/").get(authenticateUser, authorizePermissions('admin', 'owner'), getAllUsers);
//order is important - must go before :id, or else will confuse with an :id
router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
