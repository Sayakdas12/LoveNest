/**
 * seed-20users.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds the LoveNest database with 20 realistic user profiles.
 * Each user has a real-style name, bio, skills, age, gender, and a
 * high-quality portrait photo from Unsplash.
 *
 * Usage:  node seed-20users.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/user");

// ─── 20 realistic user profiles ─────────────────────────────────────────────
const USERS = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    firstName: "Priya",
    lastName: "Sharma",
    emailId: "priya.sharma@lovenest.com",
    password: "Priya@1234",
    age: 24,
    gender: "female",
    About:
      "Passionate visual artist and travel enthusiast from Jaipur. I sketch portraits in coffee shops, experiment with watercolours on weekends, and have a running list of underrated hill stations to visit. Looking for someone who values creativity, slow mornings, and genuine conversations.",
    Skills: ["Watercolour Painting", "Yoga", "Travel Planning", "Cooking", "Sketching"],
    photoUrl:
      "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    firstName: "Arjun",
    lastName: "Mehta",
    emailId: "arjun.mehta@lovenest.com",
    password: "Arjun@1234",
    age: 27,
    gender: "male",
    About:
      "Senior software engineer at a Bangalore startup by day, amateur guitarist by night. I decompress by hiking Western Ghats trails on weekends and hunting for the best street food. I believe in building things that last — in code and in relationships.",
    Skills: ["Acoustic Guitar", "Backend Engineering", "Hiking", "Street Food Hunting", "Photography"],
    photoUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: true,
    membershiptype: "gold",
    membershipExpiry: new Date("2027-01-01"),
    role: "user",
    isOnline: true,
    authProvider: "local",
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    firstName: "Neha",
    lastName: "Kapoor",
    emailId: "neha.kapoor@lovenest.com",
    password: "Neha@1234",
    age: 22,
    gender: "female",
    About:
      "Trained Bharatanatyam dancer currently teaching at a performing-arts studio in Mumbai. On days off I bake focaccia, binge Bollywood classics, and try to learn a new song on the ukulele. Life is too short to be ordinary — let's be extraordinary together.",
    Skills: ["Bharatanatyam Dance", "Ukulele", "Baking", "Singing", "Event Management"],
    photoUrl:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    firstName: "Rohan",
    lastName: "Verma",
    emailId: "rohan.verma@lovenest.com",
    password: "Rohan@1234",
    age: 29,
    gender: "male",
    About:
      "Executive chef and food blogger based in Delhi. My philosophy: the best conversations happen over a shared meal. I travel for recipes — Oaxacan mole, Sicilian arancini, Keralan fish curry — and would love to cook for you someday. Cyclist, reader, perpetual optimist.",
    Skills: ["Fine Dining Cooking", "Food Blogging", "Cycling", "Wine Pairing", "Travel"],
    photoUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: true,
    membershiptype: "silver",
    membershipExpiry: new Date("2026-12-31"),
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    firstName: "Aisha",
    lastName: "Khan",
    emailId: "aisha.khan@lovenest.com",
    password: "Aisha@1234",
    age: 25,
    gender: "female",
    About:
      "UX designer at a fintech company in Hyderabad. Avid reader of literary fiction, amateur astronomer, and borderline obsessive about great coffee. I believe in designing beautiful experiences — in products and in life. Tell me your favourite book and you have my attention.",
    Skills: ["UI/UX Design", "Reading", "Amateur Astronomy", "Coffee Brewing", "Illustration"],
    photoUrl:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: true,
    authProvider: "local",
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    firstName: "Kabir",
    lastName: "Singh",
    emailId: "kabir.singh@lovenest.com",
    password: "Kabir@12345",
    age: 31,
    gender: "male",
    About:
      "Sustainable architect in Chandigarh focused on green-building design. I run half-marathons, grow heirloom tomatoes on my terrace, and unwind with Miles Davis. Looking for someone grounded, curious, and not afraid of getting their hands dirty in a garden.",
    Skills: ["Architecture", "Marathon Running", "Organic Gardening", "Jazz Piano", "Sketching"],
    photoUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    firstName: "Meera",
    lastName: "Nair",
    emailId: "meera.nair@lovenest.com",
    password: "Meera@1234",
    age: 26,
    gender: "female",
    About:
      "Marine biologist at the National Institute of Oceanography in Goa. I surf before sunrise, free-dive on weekends, and spend evenings photographing bioluminescent plankton. The ocean is my home. Looking for someone to share sunsets and shore walks with.",
    Skills: ["Surfing", "Freediving", "Marine Research", "Underwater Photography", "Yoga"],
    photoUrl:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: true,
    membershiptype: "gold",
    membershipExpiry: new Date("2027-06-01"),
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    firstName: "Aarav",
    lastName: "Patel",
    emailId: "aarav.patel@lovenest.com",
    password: "Aarav@1234",
    age: 28,
    gender: "male",
    About:
      "Co-founder of an EdTech startup based in Ahmedabad. Cricket fanatic who plays every Sunday, evening runner who never skips leg day, and collector of terrible puns. I value authenticity over perfection. Let's grab chai and see where the conversation takes us.",
    Skills: ["Entrepreneurship", "Cricket", "Distance Running", "Public Speaking", "Music Production"],
    photoUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: true,
    authProvider: "local",
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    firstName: "Riya",
    lastName: "Gupta",
    emailId: "riya.gupta@lovenest.com",
    password: "Riya@1234",
    age: 23,
    gender: "female",
    About:
      "MSc Psychology student at Delhi University with a research focus on cognitive biases. I bake sourdough every Sunday, practise mindfulness daily, and am always up for a gallery or museum date. I am endlessly curious about what makes people tick — including you.",
    Skills: ["Clinical Psychology", "Sourdough Baking", "Meditation", "Art History", "Journaling"],
    photoUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    firstName: "Vivaan",
    lastName: "Reddy",
    emailId: "vivaan.reddy@lovenest.com",
    password: "Vivaan@1234",
    age: 30,
    gender: "male",
    About:
      "Independent filmmaker and screenwriter based in Hyderabad. I tell stories that matter — short films, documentaries, one unfinished feature. Mornings are for running, evenings for writing, weekends for scouting locations. Looking for someone who loves cinema as much as I do.",
    Skills: ["Filmmaking", "Screenwriting", "Distance Running", "Documentary Production", "Editing"],
    photoUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: true,
    membershiptype: "silver",
    membershipExpiry: new Date("2026-11-15"),
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    firstName: "Zara",
    lastName: "Hussain",
    emailId: "zara.hussain@lovenest.com",
    password: "Zara@1234",
    age: 27,
    gender: "female",
    About:
      "Fashion designer running her own label in Kolkata. I travel for textile inspiration — Rajasthan block prints, Japanese indigo, Italian silk. On rainy evenings I sew by hand and listen to Nusrat Fateh Ali Khan. I believe every person has a story worth hearing.",
    Skills: ["Fashion Design", "Hand Sewing", "Textile Art", "Travel", "Sketching"],
    photoUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 12 ─────────────────────────────────────────────────────────────────────
  {
    firstName: "Dev",
    lastName: "Malhotra",
    emailId: "dev.malhotra@lovenest.com",
    password: "Dev@12345",
    age: 33,
    gender: "male",
    About:
      "Interventional cardiologist at AIIMS Delhi who lives for weekend Himalayan treks and homemade pasta. I believe fitness and flavour belong together. If you can keep up on a trail and appreciate a home-cooked meal, we will get along brilliantly.",
    Skills: ["Medicine & Surgery", "Himalayan Trekking", "Italian Cooking", "Swimming", "Chess"],
    photoUrl:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: true,
    membershiptype: "gold",
    membershipExpiry: new Date("2027-03-01"),
    role: "user",
    isOnline: true,
    authProvider: "local",
  },

  // ── 13 ─────────────────────────────────────────────────────────────────────
  {
    firstName: "Sia",
    lastName: "Joshi",
    emailId: "sia.joshi@lovenest.com",
    password: "Sia@12345",
    age: 21,
    gender: "female",
    About:
      "Music producer and trained Carnatic vocalist from Pune. I experiment with fusion genres — blending Hindustani ragas with electronic beats — and perform at intimate venues around the city. Long drives, starry nights, and conversations that go on for hours are my love language.",
    Skills: ["Music Production", "Carnatic Vocals", "Piano", "Sound Engineering", "Long Drives"],
    photoUrl:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 14 ─────────────────────────────────────────────────────────────────────
  {
    firstName: "Ishaan",
    lastName: "Chopra",
    emailId: "ishaan.chopra@lovenest.com",
    password: "Ishaan@1234",
    age: 26,
    gender: "male",
    About:
      "Wildlife photographer who has camped in 8 national parks across India and Nepal. My alarm is set for 5 AM — always. I find joy in open skies, campfires, and being somewhere with zero phone signal. If you love nature, we should probably talk.",
    Skills: ["Wildlife Photography", "Camping", "Bird Watching", "Tracking", "Fitness Training"],
    photoUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 15 ─────────────────────────────────────────────────────────────────────
  {
    firstName: "Ananya",
    lastName: "Bose",
    emailId: "ananya.bose@lovenest.com",
    password: "Ananya@1234",
    age: 28,
    gender: "female",
    About:
      "Senior data scientist at a Kolkata-based AI company who moonlights as a thriller novelist. I love cold weather, late-night board game sessions, and solving anything that resembles a puzzle — including people. My debut novel is currently in editing. Watch this space.",
    Skills: ["Machine Learning", "Fiction Writing", "Chess", "Himalayan Trekking", "Board Games"],
    photoUrl:
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: true,
    membershiptype: "silver",
    membershipExpiry: new Date("2026-10-01"),
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 16 ─────────────────────────────────────────────────────────────────────
  {
    firstName: "Samara",
    lastName: "Iyer",
    emailId: "samara.iyer@lovenest.com",
    password: "Samara@1234",
    age: 25,
    gender: "female",
    About:
      "Environmental lawyer from Chennai who fights for coastal conservation. I practise Ashtanga yoga at dawn, grow a small herb garden, and read one non-fiction book every two weeks. Ideally looking for someone with a social conscience and a decent sense of humour.",
    Skills: ["Environmental Law", "Ashtanga Yoga", "Herb Gardening", "Non-fiction Reading", "Swimming"],
    photoUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: true,
    authProvider: "local",
  },

  // ── 17 ─────────────────────────────────────────────────────────────────────
  {
    firstName: "Karan",
    lastName: "Bajaj",
    emailId: "karan.bajaj@lovenest.com",
    password: "Karan@1234",
    age: 32,
    gender: "male",
    About:
      "Chartered accountant turned travel vlogger. I left a corner office at a Big 4 firm to document cultures and cuisines across Southeast Asia. Currently back in Mumbai recharging and planning my next route. Life is too short for spreadsheets and too long for regret.",
    Skills: ["Travel Vlogging", "Video Editing", "Motorcycling", "Scuba Diving", "Finance"],
    photoUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: true,
    membershiptype: "gold",
    membershipExpiry: new Date("2027-02-14"),
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 18 ─────────────────────────────────────────────────────────────────────
  {
    firstName: "Divya",
    lastName: "Menon",
    emailId: "divya.menon@lovenest.com",
    password: "Divya@1234",
    age: 29,
    gender: "female",
    About:
      "Paediatrician at a public hospital in Kochi with a soft spot for classical Carnatic music and backwater kayaking. I spend weekends volunteering at a rural health camp and reading poetry. Looking for someone kind, grounded, and preferably a decent cook.",
    Skills: ["Paediatric Medicine", "Carnatic Music (Veena)", "Kayaking", "Poetry Reading", "Volunteering"],
    photoUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 19 ─────────────────────────────────────────────────────────────────────
  {
    firstName: "Nikhil",
    lastName: "Srivastava",
    emailId: "nikhil.srivastava@lovenest.com",
    password: "Nikhil@1234",
    age: 30,
    gender: "male",
    About:
      "Product manager at a healthtech company in Lucknow and weekend classical tabla player. I find structure in chaos, whether it is a product roadmap or a jugalbandi. Tea over coffee, mountains over beaches, and honest conversations over small talk.",
    Skills: ["Product Management", "Tabla", "Hindustani Classical Music", "Trekking", "Strategy"],
    photoUrl:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: false,
    role: "user",
    isOnline: false,
    authProvider: "local",
  },

  // ── 20 ─────────────────────────────────────────────────────────────────────
  {
    firstName: "Tara",
    lastName: "Sinha",
    emailId: "tara.sinha@lovenest.com",
    password: "Tara@12345",
    age: 24,
    gender: "female",
    About:
      "Graphic novelist and illustrator based in Bengaluru. My ongoing series blends Indian mythology with cyberpunk aesthetics. I spend mornings at a sunlit cafe sketching characters, evenings at improv comedy nights, and weekends cycling the city. Come say hi — I promise I am funnier in person.",
    Skills: ["Graphic Novel Illustration", "Character Design", "Improv Comedy", "Cycling", "Digital Art"],
    photoUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop&crop=face&auto=format",
    isPremium: true,
    membershiptype: "silver",
    membershipExpiry: new Date("2026-09-30"),
    role: "user",
    isOnline: true,
    authProvider: "local",
  },
];

// ─── Seed function ───────────────────────────────────────────────────────────
async function seed() {
  console.log("\n  LoveNest - 20 User Seed Script");
  console.log("-".repeat(55));

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB\n");

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const u of USERS) {
    try {
      const exists = await User.findOne({ emailId: u.emailId });

      if (exists) {
        console.log(`SKIP  ${u.firstName} ${u.lastName} (already exists)`);
        skipped++;
        continue;
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(u.password, 10);

      await User.create({ ...u, password: hashedPassword });
      console.log(
        `OK    ${u.firstName} ${u.lastName}  (${u.age}yo | ${u.gender} | ${
          u.isPremium ? u.membershiptype + " premium" : "free"
        })`
      );
      inserted++;
    } catch (err) {
      console.error(`FAIL  ${u.firstName} ${u.lastName}: ${err.message}`);
      failed++;
    }
  }

  console.log("\n" + "-".repeat(55));
  console.log(
    `Done!  ${inserted} inserted  |  ${skipped} skipped  |  ${failed} failed`
  );
  console.log("-".repeat(55) + "\n");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

seed().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
