//dotenv
require("dotenv").config();

//express errors
require("express-async-errors");

//server
const express = require("express");
const app = express();

//rest of the packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

//database
const connectDB = require("./db/connect");

//routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");

//middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(morgan("tiny"));
app.use(express.json());
//signing our cookies, now available in req.signedCookies
app.use(cookieParser(process.env.JWT_SECRET));

//home route
app.get("/", (req, res) => {
  res.send("ecommerce api");
});

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

//why 404 before errorhandler? error handler needs to come last as per express rules.
//you only get to it if the route exists and there's an issue
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

//set up port variable and start function
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log("server is listening on 5000..."));
  } catch (err) {
    console.log(err);
  }
};

start();
