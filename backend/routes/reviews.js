import express from "express";
import { query } from "../db.js";

const router = express.Router();

// GET /api/reviews
router.get("/", async (req, res) => {
  try {
    const result = await query("SELECT * FROM reviews ORDER BY id ASC");
    res.json(result.rows.map(r => ({
      id: r.id,
      name: r.name,
      role: r.role,
      comment: r.comment,
      rating: r.rating
    })));
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/reviews - Add customer review
router.post("/", async (req, res) => {
  try {
    const { name, role, comment, rating } = req.body;
    if (!name || !comment) {
      return res.status(400).json({ error: "Name and comment are required" });
    }
    const result = await query(
      `INSERT INTO reviews (name, role, comment, rating, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [name.trim(), role ? role.trim() : "Reader", comment.trim(), Number(rating) || 5]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

export default router;
