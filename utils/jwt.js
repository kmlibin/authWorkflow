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

//res from auth controller,user is tokenuser from auth controller
const attachCookiesToResponse = ({ res, user }) => {
  //create token
  const token = createJWT({ payload: user });
  //set up the cookie
  const oneDay = 1000 * 60 * 60 * 24;
  //send back to frontend, attach a cookie
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
  });
};
module.exports = { createJWT, isTokenValid, attachCookiesToResponse };
