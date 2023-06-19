const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

//next, gets passed into our route next
//remember, we have token found in signedCookies. token the name we gave
const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    console.log("no token");
  } else {
    console.log("token present");
  }

  next();
};

module.exports = {authenticateUser};

//all user routes will need this, so can go to app.js and stick it in front of user router. or, set it up in your routes.
