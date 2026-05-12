require("dotenv").config();
const mongoose = require("mongoose");

const photoMap = {
  "Riya":        "https://randomuser.me/api/portraits/women/26.jpg",
  "Karan":       "https://randomuser.me/api/portraits/men/46.jpg",
  "Nisha":       "https://randomuser.me/api/portraits/women/51.jpg",
  "Rohan":       "https://randomuser.me/api/portraits/men/33.jpg",
  "Meera":       "https://randomuser.me/api/portraits/women/60.jpg",
  "Sameer":      "https://randomuser.me/api/portraits/men/64.jpg",
  "Pooja":       "https://randomuser.me/api/portraits/women/29.jpg",
  "Nikhil":      "https://randomuser.me/api/portraits/men/71.jpg",
  "Test":        "https://randomuser.me/api/portraits/men/10.jpg",
  "TestEdited":  "https://randomuser.me/api/portraits/men/10.jpg",
  "AliceEdited": "https://randomuser.me/api/portraits/women/5.jpg",
  "Bob":         "https://randomuser.me/api/portraits/men/15.jpg",
  "Demo":        "https://randomuser.me/api/portraits/men/20.jpg",
};

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  let total = 0;
  for (const [name, url] of Object.entries(photoMap)) {
    const r = await db.collection("users").updateMany(
      { firstName: name },
      { $set: { photoUrl: url } }
    );
    if (r.modifiedCount) { console.log("Fixed:", name); total += r.modifiedCount; }
  }
  console.log("Done. Total fixed:", total);
  process.exit(0);
});
