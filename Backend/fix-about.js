require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const r = await db.collection("users").updateMany(
    { About: "No description provided" },
    { $set: { About: "" } }
  );
  console.log("Updated", r.modifiedCount, "users - cleared old default About text");
  process.exit(0);
});
