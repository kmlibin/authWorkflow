const CustomError = require("../errors");
const { isTokenValid } = require("../utils");
const attachCookiesToResponse = require("../utils");
const Token = require("../models/Token");

const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;
  //check access token first b/c shorter expiration. if it's there, fine, just pass on to next req
  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user;
      return next();
    }
    //if no access token
    const payload = isTokenValid(refreshToken);
    //check whether it exists and isValid is true
    //when we set up refresh token, we set up a user and refresh token as the payload, which is why we can access here.
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });
    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError("Authentication Invalid");
    }
    //if valid, we want to pass it on and attach the cookies
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });
    req.user = payload.user;
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
};

//authorize permissions...if it's an admin, we will pass it on to the next route
//we want to return a function, see comments in userRoutes
//...rest operator collects all values being passed in
const authorizePermissions = (...rest) => {
  //callback
  return (req, res, next) => {
    if (!rest.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError("unauthorized access");
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };

//all user routes will need this, so can go to app.js and stick it in front of user router. or, set it up in your routes.
