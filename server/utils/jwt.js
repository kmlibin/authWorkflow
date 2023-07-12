const jwt = require("jsonwebtoken");

//creates the token
//payload passed in from the controller..object or not, preference
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  //removed expires because the cookies handle
  return token;
};

//use in auth middleware
const isTokenValid = ({ token }) => {
  console.log(token);
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  //create access token
  const accessTokenJWT = createJWT({ payload: { user } });
  //create refresh token
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });
  
  const oneDay = 1000 * 60 * 60 * 24;
  //set up the cookies
  //access token
  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: 2000,
  });
  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });
};

//res from auth controller,user is tokenuser from auth controller
// const attachSingleCookieToResponse = ({ res, user }) => {
//   //create token
//   const token = createJWT({ payload: user });
//   //set up the cookie
//   const oneDay = 1000 * 60 * 60 * 24;
//   //send back to frontend, attach a cookie
//   res.cookie("token", token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === 'production',
//     signed: true
//   });
// };
module.exports = { createJWT, isTokenValid, attachCookiesToResponse };
