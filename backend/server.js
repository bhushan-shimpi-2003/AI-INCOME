import app from "./app.js";
import { initializeDatabase } from "./initDb.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`✓ AI Income Backend Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
