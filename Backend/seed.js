require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/user");

const USERS = [
  {
    firstName: "Priya", lastName: "Sharma", emailId: "priya.sharma@lovenest.com", password: "Priya@1234",
    age: 24, gender: "female",
    About: "Passionate artist and travel enthusiast. I paint in my spare time and love exploring new cuisines. Looking for someone who appreciates creativity and long walks.",
    Skills: ["Painting", "Cooking", "Yoga", "Travel"],
    photoUrl: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Arjun", lastName: "Mehta", emailId: "arjun.mehta@lovenest.com", password: "Arjun@1234",
    age: 27, gender: "male",
    About: "Software engineer by day, guitarist by night. I love hiking on weekends and trying out street food. Looking for a genuine connection with someone who shares my adventurous spirit.",
    Skills: ["Guitar", "Hiking", "Coding", "Photography"],
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Neha", lastName: "Kapoor", emailId: "neha.kapoor@lovenest.com", password: "Neha@1234",
    age: 22, gender: "female",
    About: "Dance teacher with a love for Bollywood movies and chai. I believe in living life to the fullest and cherishing every moment. Let's create memories together!",
    Skills: ["Dancing", "Singing", "Baking", "Sketching"],
    photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Rohan", lastName: "Verma", emailId: "rohan.verma@lovenest.com", password: "Rohan@1234",
    age: 29, gender: "male",
    About: "Chef and food blogger who believes the best conversations happen over good food. I travel to learn new recipes and would love to cook for you someday.",
    Skills: ["Cooking", "Blogging", "Cycling", "Reading"],
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Aisha", lastName: "Khan", emailId: "aisha.khan@lovenest.com", password: "Aisha@1234",
    age: 25, gender: "female",
    About: "Bookworm, coffee addict, and part-time stargazer. I work in UX design and believe beautiful things deserve attention. Looking for someone who recommends good books.",
    Skills: ["Reading", "UI/UX Design", "Astronomy", "Coffee Art"],
    photoUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Kabir", lastName: "Singh", emailId: "kabir.singh@lovenest.com", password: "Kabir@1234",
    age: 31, gender: "male",
    About: "Architect with a passion for sustainable living. I run marathons, grow vegetables on my terrace, and love jazz music. Looking for someone grounded and full of life.",
    Skills: ["Architecture", "Running", "Gardening", "Jazz"],
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Meera", lastName: "Nair", emailId: "meera.nair@lovenest.com", password: "Meera@1234",
    age: 26, gender: "female",
    About: "Marine biologist who loves the ocean. I surf, dive, and spend weekends at the beach. Looking for someone to share sunsets with.",
    Skills: ["Surfing", "Diving", "Marine Biology", "Photography"],
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Aarav", lastName: "Patel", emailId: "aarav.patel@lovenest.com", password: "Aarav@1234",
    age: 28, gender: "male",
    About: "Startup founder obsessed with cricket and evening runs. I love deep conversations, bad puns, and good music. Let's grab a coffee and see where it goes!",
    Skills: ["Cricket", "Entrepreneurship", "Running", "Music"],
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Riya", lastName: "Gupta", emailId: "riya.gupta@lovenest.com", password: "Riya@1234",
    age: 23, gender: "female",
    About: "Psychology student who loves unravelling human behaviour. I bake sourdough, practice mindfulness, and am always up for a museum date.",
    Skills: ["Psychology", "Baking", "Meditation", "Art History"],
    photoUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Vivaan", lastName: "Reddy", emailId: "vivaan.reddy@lovenest.com", password: "Vivaan@1234",
    age: 30, gender: "male",
    About: "Filmmaker and storyteller who sees the world through a lens. I spend evenings writing scripts, mornings running, and weekends scouting locations.",
    Skills: ["Filmmaking", "Writing", "Running", "Traveling"],
    photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Zara", lastName: "Hussain", emailId: "zara.hussain@lovenest.com", password: "Zara@1234",
    age: 27, gender: "female",
    About: "Fashion designer with a flair for the dramatic. I travel for inspiration, sew in my free time, and believe every person has a story worth hearing.",
    Skills: ["Fashion Design", "Sewing", "Travel", "Sketching"],
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Dev", lastName: "Malhotra", emailId: "dev.malhotra@lovenest.com", password: "Dev@12345",
    age: 33, gender: "male",
    About: "Cardiologist who lives for weekend treks and homemade pasta. Fitness and flavour go hand in hand. Looking for someone who can keep up on the trail and at the table.",
    Skills: ["Trekking", "Cooking", "Medicine", "Swimming"],
    photoUrl: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Sia", lastName: "Joshi", emailId: "sia.joshi@lovenest.com", password: "Sia@12345",
    age: 21, gender: "female",
    About: "Music producer and classical vocalist. I love experimenting with fusion genres and performing at small venues. Looking for someone who appreciates good music and long drives.",
    Skills: ["Music Production", "Classical Singing", "Piano", "Long Drives"],
    photoUrl: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Ishaan", lastName: "Chopra", emailId: "ishaan.chopra@lovenest.com", password: "Ishaan@1234",
    age: 26, gender: "male",
    About: "Wildlife photographer who has camped in 6 national parks. I find joy in early mornings, open skies, and good company. Let's go somewhere with zero phone signal.",
    Skills: ["Photography", "Camping", "Bird Watching", "Fitness"],
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
  },
  {
    firstName: "Ananya", lastName: "Bose", emailId: "ananya.bose@lovenest.com", password: "Ananya@1234",
    age: 28, gender: "female",
    About: "Data scientist who moonlights as a thriller novelist. I love cold weather, board games, and solving anything that looks like a puzzle — including people.",
    Skills: ["Data Science", "Writing", "Chess", "Trekking"],
    photoUrl: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=400&fit=crop&crop=face",
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  let inserted = 0, skipped = 0;
  for (const u of USERS) {
    try {
      const exists = await User.findOne({ emailId: u.emailId });
      if (exists) { console.log("Skipping " + u.firstName + " " + u.lastName + " (already exists)"); skipped++; continue; }
      const hashedPassword = await require("bcrypt").hash(u.password, 10);
      await User.create({ ...u, password: hashedPassword });
      console.log("Created " + u.firstName + " " + u.lastName);
      inserted++;
    } catch (err) {
      console.error("Failed " + u.firstName + ": " + err.message);
    }
  }
  console.log("Done. " + inserted + " inserted, " + skipped + " skipped.");
  await mongoose.disconnect();
}
seed().catch(err => { console.error(err.message); process.exit(1); });