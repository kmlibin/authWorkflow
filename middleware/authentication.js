const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

//next, gets passed into our route next
//remember, we have token found in signedCookies. token the name we gave
const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
  try {
    //when user lgs in, creates a token user, attaches cookies to response, createJWT and user is payload. user info is encoded
    //into the token. Istokenvalid uses jwt.verify, which decodes the token and thus the user. we then add it to the req object
    const payload = isTokenValid({ token }); 
    
    //adding to the request object
    req.user = { name: payload.name, userId: payload._id, role: payload.role };
    //payload shows user object..why? payload in isTokenValid does not return this
    // console.log(payload);
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
};

module.exports = { authenticateUser };

//all user routes will need this, so can go to app.js and stick it in front of user router. or, set it up in your routes.
