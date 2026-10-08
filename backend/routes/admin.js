import express from "express";
import { query } from "../db.js";

const router = express.Router();

// Supported default credentials
const DEFAULT_ADMINS = [
  "admin",
  "bhushan",
  "bhushanshimpi2003@gmail.com",
  "shimpibhushan2503@gmail.com",
  "7020710581"
];

const MASTER_PASSWORDS = [
  "Bhush@252003",
  "admin79",
  "bhushan2026",
  "79"
];

// Helper to ensure admin_users table exists
async function ensureAdminTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Ensure default admin user exists
    const check = await query("SELECT id FROM admin_users WHERE username = 'admin'");
    if (check.rows.length === 0) {
      await query(`
        INSERT INTO admin_users (username, email, password_hash)
        VALUES ('admin', 'bhushanshimpi2003@gmail.com', 'Bhush@252003')
        ON CONFLICT (username) DO NOTHING;
      `);
    }
  } catch (err) {
    console.warn("Notice ensuring admin_users table:", err.message);
  }
}

// POST /api/admin/login - Authenticate Admin with ID and Password
router.post("/login", async (req, res) => {
  try {
    await ensureAdminTable();

    const { loginId, username, password } = req.body;
    const cleanId = (loginId || username || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanId || !cleanPass) {
      return res.status(400).json({
        success: false,
        error: "Both Admin Login ID and Password are required."
      });
    }

    // 1. Check database admin_users table
    const dbUserRes = await query(
      "SELECT * FROM admin_users WHERE LOWER(username) = $1 OR LOWER(email) = $1 LIMIT 1",
      [cleanId]
    );

    let isMatch = false;

    if (dbUserRes.rows.length > 0) {
      const dbUser = dbUserRes.rows[0];
      if (dbUser.password_hash === cleanPass || MASTER_PASSWORDS.includes(cleanPass)) {
        isMatch = true;
      }
    } else if (DEFAULT_ADMINS.includes(cleanId) && MASTER_PASSWORDS.includes(cleanPass)) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid Admin Login ID or Password. Please try again."
      });
    }

    const token = "admin_auth_" + Buffer.from(`${cleanId}:${Date.now()}`).toString("base64");

    return res.json({
      success: true,
      token,
      user: {
        username: "admin",
        name: "BHUSHAN KISHOR SHIMPI",
        email: "bhushanshimpi2003@gmail.com",
        role: "Super Admin"
      },
      message: "Admin authentication successful."
    });
  } catch (err) {
    console.error("Error during admin login:", err);
    res.status(500).json({
      success: false,
      error: "Authentication service error. Please try again."
    });
  }
});

// POST /api/admin/change-password - Update Admin Password
router.post("/change-password", async (req, res) => {
  try {
    await ensureAdminTable();
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required."
      });
    }

    if (newPassword.length < 5) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 5 characters long."
      });
    }

    // Verify current password
    const check = await query("SELECT * FROM admin_users WHERE username = 'admin' LIMIT 1");
    const existing = check.rows[0];

    const isCurrentValid =
      (existing && existing.password_hash === currentPassword) ||
      MASTER_PASSWORDS.includes(currentPassword);

    if (!isCurrentValid) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect."
      });
    }

    // Update in database
    await query(
      `INSERT INTO admin_users (username, email, password_hash, updated_at)
       VALUES ('admin', 'bhushanshimpi2003@gmail.com', $1, NOW())
       ON CONFLICT (username) DO UPDATE SET password_hash = $1, updated_at = NOW()`,
      [newPassword]
    );

    return res.json({
      success: true,
      message: "Admin password updated successfully!"
    });
  } catch (err) {
    console.error("Error updating admin password:", err);
    res.status(500).json({ success: false, error: "Failed to update password." });
  }
});

export default router;
