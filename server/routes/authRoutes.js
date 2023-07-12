const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.post("/verify-email", verifyEmail);

module.exports = router;
