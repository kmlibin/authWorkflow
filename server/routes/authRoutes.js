const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middleware/authentication");

const {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.delete("/logout", authenticateUser, logoutUser);
router.post("/verify-email", verifyEmail);

module.exports = router;
