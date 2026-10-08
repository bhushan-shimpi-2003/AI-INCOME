import express from "express";
import cors from "cors";
import settingsRouter from "./routes/settings.js";
import ordersRouter from "./routes/orders.js";
import readersRouter from "./routes/readers.js";
import chaptersRouter from "./routes/chapters.js";
import contactRouter from "./routes/contact.js";
import reviewsRouter from "./routes/reviews.js";
import faqsRouter from "./routes/faqs.js";
import adminRouter from "./routes/admin.js";

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Database initialization trigger endpoint
app.all("/api/init-db", async (req, res) => {
  try {
    const { initializeDatabase } = await import("./initDb.js");
    await initializeDatabase();
    res.json({ success: true, message: "PostgreSQL database initialized and seeded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes
app.use("/api/settings", settingsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/readers", readersRouter);
app.use("/api/chapters", chaptersRouter);
app.use("/api/contact", contactRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/faqs", faqsRouter);
app.use("/api/admin", adminRouter);

// Catch-all 404 for unhandled API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

export default app;
