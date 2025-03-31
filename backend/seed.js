import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Doctor from "./models/Doctors.js"; // ✅ Ensure correct import

dotenv.config();

// ✅ Properly Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully!");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1); // Exit process if connection fails
    }
};

// ✅ Read JSON file
const filePath = path.resolve("doctorslist.json"); // Ensure correct path
const readJSONFile = () => {
    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("❌ Error reading JSON file:", error);
        return [];
    }
};

// ✅ Seed Data
const seedDB = async () => {
    await connectDB(); // ✅ Ensure DB is connected before running queries
    try {
        const doctors = readJSONFile();
        if (doctors.length === 0) {
            console.log("⚠ No data found in JSON file.");
            return;
        }

        await Doctor.deleteMany(); // ✅ Ensure it doesn't time out
        await Doctor.insertMany(doctors);
        console.log("✅ Doctors Seeded Successfully");
    } catch (err) {
        console.error("❌ Seeding Error:", err);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed.");
    }
};

// ✅ Run Seeding
seedDB();