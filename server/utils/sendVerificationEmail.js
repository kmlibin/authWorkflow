const sendEmail = require("./sendEmail");

//origin is going to be the url from the frontend, whether localhost or production
const sendVerificationEmail = async ({
  name,
  email,
  //use these two values to contruct the frontend URL
  verificationToken,
  origin,
}) => {
  // user/verifyemail route was set up on frontend
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;

  const message = `<p>Please confirm your email by clicking on the following link : 
  <a href="${verifyEmail}">Verify Email</a> </p>`;
  return sendEmail({
    to: email,
    subject: "email confirmation",
    html: `<h4>hello ${name}</h4>
    ${message}`,
  });
};

module.exports = sendVerificationEmail;
