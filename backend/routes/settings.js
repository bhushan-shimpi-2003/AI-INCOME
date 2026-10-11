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

async function handleUpdateSettings(req, res) {
  try {
    const s = req.body || {};
    const values = [
      s.bookTitle !== undefined && s.bookTitle !== null ? String(s.bookTitle) : null,
      s.bookSubtitle !== undefined && s.bookSubtitle !== null ? String(s.bookSubtitle) : null,
      s.authorName !== undefined && s.authorName !== null ? String(s.authorName) : null,
      s.tagline !== undefined && s.tagline !== null ? String(s.tagline) : null,
      s.upiId !== undefined && s.upiId !== null ? String(s.upiId) : null,
      s.payeeName !== undefined && s.payeeName !== null ? String(s.payeeName) : null,
      s.price !== undefined && s.price !== null && s.price !== "" ? Number(s.price) : null,
      s.originalPrice !== undefined && s.originalPrice !== null && s.originalPrice !== "" ? Number(s.originalPrice) : null,
      s.upiNote !== undefined && s.upiNote !== null ? String(s.upiNote) : null,
      s.supportEmail !== undefined && s.supportEmail !== null ? String(s.supportEmail) : null,
      s.supportPhone !== undefined && s.supportPhone !== null ? String(s.supportPhone) : null
    ];

    let result = await query(
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
      values
    );

    if (result.rows.length === 0) {
      result = await query(
        `INSERT INTO site_settings (
          id, book_title, book_subtitle, author_name, tagline, upi_id, payee_name, 
          price, original_price, upi_note, support_email, support_phone, updated_at
        ) VALUES (
          1, 
          COALESCE($1, 'AI Income for Everyone'), 
          COALESCE($2, 'The Practical Blueprint to Earning Extra Income with Free AI Tools'), 
          COALESCE($3, 'BHUSHAN KISHOR SHIMPI'), 
          COALESCE($4, 'A practical, beginner-friendly guide to earning extra income with AI tools.'), 
          COALESCE($5, 'bhushan.shimpi1@ybl'), 
          COALESCE($6, 'BHUSHAN KISHOR SHIMPI'), 
          COALESCE($7, 79), 
          COALESCE($8, 499), 
          COALESCE($9, 'AI Income Ebook - BHUSHAN KISHOR SHIMPI'), 
          COALESCE($10, 'bhushanshimpi2003@gmail.com'), 
          COALESCE($11, '7020710581'), 
          NOW()
        ) RETURNING *`,
        values
      );
    }

    res.json(formatSettings(result.rows[0]));
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ error: "Failed to update settings: " + err.message });
  }
}

// PUT /api/settings or POST /api/settings
router.put("/", handleUpdateSettings);
router.post("/", handleUpdateSettings);

export default router;
