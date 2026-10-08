import express from "express";
import { query } from "../db.js";

const router = express.Router();

// GET /api/readers - List all registered readers
router.get("/", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        r.email,
        r.name,
        r.is_active,
        r.granted_at,
        r.notes,
        COUNT(o.id) as order_count,
        MAX(o.created_at) as last_order_date
      FROM readers r
      LEFT JOIN orders o ON LOWER(o.email) = LOWER(r.email)
      GROUP BY r.email, r.name, r.is_active, r.granted_at, r.notes
      ORDER BY r.granted_at DESC
    `);

    res.json(result.rows.map(r => ({
      email: r.email,
      name: r.name || r.email.split("@")[0],
      isActive: r.is_active,
      grantedAt: r.granted_at,
      notes: r.notes,
      orderCount: parseInt(r.order_count, 10) || 0,
      lastOrderDate: r.last_order_date
    })));
  } catch (err) {
    console.error("Error fetching readers:", err);
    res.status(500).json({ error: "Failed to fetch readers" });
  }
});

// GET /api/readers/verify?email=... - Check reader access status
router.get("/verify", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email || !email.includes("@")) {
      return res.json({ unlocked: false, message: "Invalid email" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check readers table
    const readerRes = await query(
      "SELECT * FROM readers WHERE LOWER(email) = $1 AND is_active = TRUE",
      [cleanEmail]
    );

    if (readerRes.rows.length > 0) {
      return res.json({
        unlocked: true,
        email: cleanEmail,
        name: readerRes.rows[0].name,
        source: "reader"
      });
    }

    // 2. Check orders table
    const orderRes = await query(
      "SELECT * FROM orders WHERE LOWER(email) = $1 AND status = 'Completed' LIMIT 1",
      [cleanEmail]
    );

    if (orderRes.rows.length > 0) {
      // Auto-upsert into readers
      await query(
        `INSERT INTO readers (email, name, is_active, granted_at)
         VALUES ($1, $2, TRUE, NOW())
         ON CONFLICT (email) DO UPDATE SET is_active = TRUE`,
        [cleanEmail, orderRes.rows[0].name]
      );

      return res.json({
        unlocked: true,
        email: cleanEmail,
        name: orderRes.rows[0].name,
        source: "order"
      });
    }

    res.json({ unlocked: false, message: "No active access found for this email" });
  } catch (err) {
    console.error("Error verifying access:", err);
    res.status(500).json({ unlocked: false, error: "Verification failed" });
  }
});

// POST /api/readers - Manually grant access
router.post("/", async (req, res) => {
  try {
    const { email, name, notes } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split("@")[0]).trim();

    const result = await query(
      `INSERT INTO readers (email, name, is_active, granted_at, notes)
       VALUES ($1, $2, TRUE, NOW(), $3)
       ON CONFLICT (email)
       DO UPDATE SET is_active = TRUE, name = EXCLUDED.name, notes = EXCLUDED.notes
       RETURNING *`,
      [cleanEmail, cleanName, notes || "Manually granted by admin"]
    );

    res.status(201).json({
      success: true,
      reader: result.rows[0]
    });
  } catch (err) {
    console.error("Error adding reader:", err);
    res.status(500).json({ error: "Failed to grant reader access" });
  }
});

// POST /api/readers/:email/revoke
router.post("/:email/revoke", async (req, res) => {
  try {
    const cleanEmail = decodeURIComponent(req.params.email).trim().toLowerCase();
    await query(
      "UPDATE readers SET is_active = FALSE WHERE LOWER(email) = $1",
      [cleanEmail]
    );
    res.json({ success: true, message: `Access revoked for ${cleanEmail}` });
  } catch (err) {
    console.error("Error revoking access:", err);
    res.status(500).json({ error: "Failed to revoke access" });
  }
});

export default router;
