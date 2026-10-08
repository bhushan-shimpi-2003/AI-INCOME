import express from "express";
import { query } from "../db.js";

const router = express.Router();

// Helper to map DB row to frontend camelCase settings object
function formatSettings(row) {
  if (!row) return null;
  return {
    bookTitle: row.book_title,
    bookSubtitle: row.book_subtitle,
    authorName: row.author_name,
    tagline: row.tagline,
    upiId: row.upi_id,
    payeeName: row.payee_name,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    upiNote: row.upi_note,
    supportEmail: row.support_email,
    supportPhone: row.support_phone,
    updatedAt: row.updated_at
  };
}

// GET /api/settings
router.get("/", async (req, res) => {
  try {
    const result = await query("SELECT * FROM site_settings WHERE id = 1");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Settings not found" });
    }
    res.json(formatSettings(result.rows[0]));
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/settings or POST /api/settings
router.put("/", async (req, res) => {
  try {
    const s = req.body;
    const result = await query(
      `UPDATE site_settings
       SET book_title = COALESCE($1, book_title),
           book_subtitle = COALESCE($2, book_subtitle),
           author_name = COALESCE($3, author_name),
           tagline = COALESCE($4, tagline),
           upi_id = COALESCE($5, upi_id),
           payee_name = COALESCE($6, payee_name),
           price = COALESCE($7, price),
           original_price = COALESCE($8, original_price),
           upi_note = COALESCE($9, upi_note),
           support_email = COALESCE($10, support_email),
           support_phone = COALESCE($11, support_phone),
           updated_at = NOW()
       WHERE id = 1
       RETURNING *`,
      [
        s.bookTitle,
        s.bookSubtitle,
        s.authorName,
        s.tagline,
        s.upiId,
        s.payeeName,
        s.price !== undefined ? Number(s.price) : null,
        s.originalPrice !== undefined ? Number(s.originalPrice) : null,
        s.upiNote,
        s.supportEmail,
        s.supportPhone
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Settings not found" });
    }
    res.json(formatSettings(result.rows[0]));
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Also support POST for clients that prefer POST
router.post("/", async (req, res) => {
  try {
    const s = req.body;
    const result = await query(
      `UPDATE site_settings
       SET book_title = COALESCE($1, book_title),
           book_subtitle = COALESCE($2, book_subtitle),
           author_name = COALESCE($3, author_name),
           tagline = COALESCE($4, tagline),
           upi_id = COALESCE($5, upi_id),
           payee_name = COALESCE($6, payee_name),
           price = COALESCE($7, price),
           original_price = COALESCE($8, original_price),
           upi_note = COALESCE($9, upi_note),
           support_email = COALESCE($10, support_email),
           support_phone = COALESCE($11, support_phone),
           updated_at = NOW()
       WHERE id = 1
       RETURNING *`,
      [
        s.bookTitle,
        s.bookSubtitle,
        s.authorName,
        s.tagline,
        s.upiId,
        s.payeeName,
        s.price !== undefined ? Number(s.price) : null,
        s.originalPrice !== undefined ? Number(s.originalPrice) : null,
        s.upiNote,
        s.supportEmail,
        s.supportPhone
      ]
    );

    res.json(formatSettings(result.rows[0]));
  } catch (err) {
    console.error("Error saving settings:", err);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

export default router;
