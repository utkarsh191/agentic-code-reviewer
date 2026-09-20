// server/src/config/db.ts
import mongoose from "mongoose";

// true = connected, false = nahi hua. Ye function kabhi throw nahi karta.
const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("MONGODB_URI is not set. Continuing without MongoDB.");
    return false;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    // Sirf message log karte hain. Poore error mein connection details aa sakti hain.
    console.error(
      "MongoDB connection failed:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
};

export default connectDB;