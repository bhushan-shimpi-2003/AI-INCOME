import express from "express";
import { query } from "../db.js";

const router = express.Router();

// POST /api/contact - Submit inquiry
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanMessage = message.trim();

    const result = await query(
      `INSERT INTO contact_messages (name, email, message, status, created_at)
       VALUES ($1, $2, $3, 'Unread', NOW())
       RETURNING *`,
      [cleanName, cleanEmail, cleanMessage]
    );

    res.status(201).json({
      success: true,
      message: "Thank you for reaching out. We will get back to you shortly.",
      inquiry: result.rows[0]
    });
  } catch (err) {
    console.error("Error saving contact message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET /api/contact - View inquiries
router.get("/", async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching contact messages:", err);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

export default router;
