require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/user");

const users = [
  {
    firstName: "Priya",
    lastName: "Sharma",
    emailId: "priya.sharma@example.com",
    password: "Love@1234Ab",
    age: 24,
    gender: "female",
    About: "Coffee lover, bookworm and adventure seeker. Looking for someone to explore life with!",
    Skills: ["Yoga", "Cooking", "Travel", "Photography"],
    photoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    firstName: "Arjun",
    lastName: "Mehta",
    emailId: "arjun.mehta@example.com",
    password: "Love@1234Ab",
    age: 27,
    gender: "male",
    About: "Software engineer by day, guitar player by night. Love hiking and trying new cuisines.",
    Skills: ["Guitar", "Hiking", "Coding", "Cricket"],
    photoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    firstName: "Sneha",
    lastName: "Patel",
    emailId: "sneha.patel@example.com",
    password: "Love@1234Ab",
    age: 23,
    gender: "female",
    About: "Dancer, foodie and Netflix addict. Looking for my partner in crime.",
    Skills: ["Dancing", "Cooking", "Painting", "Fitness"],
    photoUrl: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    firstName: "Rahul",
    lastName: "Verma",
    emailId: "rahul.verma@example.com",
    password: "Love@1234Ab",
    age: 29,
    gender: "male",
    About: "Fitness freak and startup founder. Looking for someone who loves deep conversations.",
    Skills: ["Gym", "Entrepreneurship", "Reading", "Travelling"],
    photoUrl: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    firstName: "Ananya",
    lastName: "Singh",
    emailId: "ananya.singh@example.com",
    password: "Love@1234Ab",
    age: 25,
    gender: "female",
    About: "Artist and dreamer. I believe in stargazing, long drives and good conversations.",
    Skills: ["Painting", "Music", "Reading", "Astronomy"],
    photoUrl: "https://randomuser.me/api/portraits/women/90.jpg",
  },
  {
    firstName: "Vikram",
    lastName: "Nair",
    emailId: "vikram.nair@example.com",
    password: "Love@1234Ab",
    age: 31,
    gender: "male",
    About: "Doctor who loves travel and food. Life is short — let us make it sweet!",
    Skills: ["Medicine", "Travel", "Cooking", "Swimming"],
    photoUrl: "https://randomuser.me/api/portraits/men/55.jpg",
  },
  {
    firstName: "Kavya",
    lastName: "Reddy",
    emailId: "kavya.reddy@example.com",
    password: "Love@1234Ab",
    age: 22,
    gender: "female",
    About: "Final year engineering student. Love dogs, memes and midnight coffee.",
    Skills: ["Coding", "Gaming", "Dogs", "Sketching"],
    photoUrl: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    firstName: "Aditya",
    lastName: "Kapoor",
    emailId: "aditya.kapoor@example.com",
    password: "Love@1234Ab",
    age: 28,
    gender: "male",
    About: "Musician and traveller. I speak fluent sarcasm and movie dialogues.",
    Skills: ["Music", "Travel", "Movies", "Football"],
    photoUrl: "https://randomuser.me/api/portraits/men/21.jpg",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    let created = 0;
    let skipped = 0;

    for (const u of users) {
      const exists = await User.findOne({ emailId: u.emailId });
      if (exists) {
        console.log(`  SKIP (already exists): ${u.emailId}`);
        skipped++;
        continue;
      }
      const hash = await bcrypt.hash(u.password, 10);
      await User.create({ ...u, password: hash });
      console.log(`  CREATED: ${u.firstName} ${u.lastName} <${u.emailId}>`);
      created++;
    }

    console.log(`\nDone! Created: ${created}  Skipped: ${skipped}`);
    console.log("Password for all seeded users: Love@1234Ab");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
}

seed();
