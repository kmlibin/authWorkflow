const jwt = require("jsonwebtoken");

//creates the token
//payload passed in from the controller..object or not, preference
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

//use in auth middleware
const isTokenValid = ({ token }) => {
  jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { createJWT, isTokenValid };
