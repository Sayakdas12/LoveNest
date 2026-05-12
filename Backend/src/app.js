const express = require("express");
const connectionDB = require("./config/database");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express.json()); // middleWare to read the json data...
app.use(cookieParser());    // Middleware to parse cookies
app.use("/uploads", require("express").static(require("path").join(__dirname, "../uploads")));


const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const paymentRouter = require("./routes/payment");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);



//get the user when match the Email to the database


// Database Connection
connectionDB()
  .then(() => {
    console.log("✅ Database Connection is Successfully...");
    // ------------------- SERVER -------------------
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Database Cannot be connected....", err.message);
  });






















// // Sample user data (mocked like a database)
