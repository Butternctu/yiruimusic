import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const LESSON_TYPES = [
  { id: 'private-60', duration: 60 },
  { id: 'private-30', duration: 30 },
  { id: 'masterclass', duration: 90 },
  { id: 'performance-coaching', duration: 60 },
];

async function seedSlots() {
  console.log("Starting to seed time slots...");

  // Check if we already have slots to avoid duplicates if run multiple times quickly
  // (In a real app, you'd probably check for specific dates)
  
  const now = new Date();
  const nextFourWeeks = new Date();
  nextFourWeeks.setDate(now.getDate() + 28);

  let slotsCreated = 0;

  // Create some sample slots for the next 4 weeks
  for (let d = 0; d < 28; d++) {
    const currentDay = new Date(now);
    currentDay.setDate(now.getDate() + d);
    currentDay.setHours(0, 0, 0, 0);

    // Skip weekends for mock data
    const dayOfWeek = currentDay.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Add 2-3 slots per weekday
    const startHour = 10; // 10 AM
    for (let i = 0; i < 3; i++) {
        const slotTime = new Date(currentDay);
        slotTime.setHours(startHour + (i * 2), 0, 0, 0); // 10am, 12pm, 2pm
        
        const randomType = LESSON_TYPES[Math.floor(Math.random() * LESSON_TYPES.length)];

        await addDoc(collection(db, "timeSlots"), {
            dateTime: Timestamp.fromDate(slotTime),
            duration: randomType.duration,
            lessonType: randomType.id,
            status: "available",
            bookedBy: null,
            bookedAt: null,
            createdAt: Timestamp.now(),
        });
        slotsCreated++;
    }
  }

  console.log(`Successfully seeded ${slotsCreated} time slots.`);
  process.exit(0);
}

seedSlots().catch(err => {
  console.error("Error seeding slots:", err);
  process.exit(1);
});
