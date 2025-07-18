const express = require("express");
const connectionDB = require("./config/database");

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express.json()); // middleWare to read the json data...
app.use(cookieParser());    // Middleware to parse cookies


const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);



//get the user when match the Email to the database


// Database Connection
connectionDB()
  .then(() => {
    console.log("✅ Database Connection is Successfully...");
  })
  .catch((err) => {
    console.log("✅ Database Cannot be connected....");
  });

// ------------------- SERVER -------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});






















// // Sample user data (mocked like a database)
