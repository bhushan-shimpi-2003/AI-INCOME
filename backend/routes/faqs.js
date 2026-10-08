import express from "express";
import { query } from "../db.js";

const router = express.Router();

// GET /api/faqs
router.get("/", async (req, res) => {
  try {
    const result = await query("SELECT * FROM faqs ORDER BY display_order ASC, id ASC");
    res.json(result.rows.map(r => ({
      id: r.id,
      q: r.question,
      a: r.answer
    })));
  } catch (err) {
    console.error("Error fetching FAQs:", err);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

export default router;
