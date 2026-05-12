import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correctly locate the .env file inside the src folder
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Neural-Link] Global Engine active on port ${PORT}`);
      console.log(`[Neural-Link] Token Verification: ${process.env.GITHUB_TOKEN ? "SECURED" : "MISSING"}`);
    });
  } catch (err) {
    console.error("[Neural-Link] Critical Sync Failure:", err.message);
  }
};

startServer();
