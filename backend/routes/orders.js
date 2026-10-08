import express from "express";
import { query } from "../db.js";

const router = express.Router();

function formatOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    amount: Number(row.amount),
    currency: row.currency || "INR",
    paymentMethod: row.payment_method,
    paymentReference: row.payment_reference,
    status: row.status,
    orderType: row.order_type,
    type: row.order_type,
    date: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
  };
}

// GET /api/orders
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 500, 1000);
    const result = await query(
      "SELECT * FROM orders ORDER BY created_at DESC LIMIT $1",
      [limit]
    );
    res.json(result.rows.map(formatOrder));
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/analytics
router.get("/analytics", async (req, res) => {
  try {
    // 1. Total KPI aggregates
    const totalRes = await query(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(DISTINCT LOWER(email)) as unique_readers
      FROM orders
      WHERE status = 'Completed'
    `);

    // 2. Today's KPI aggregates (IST timezone: UTC + 5:30)
    const todayRes = await query(`
      SELECT 
        COUNT(*) as today_sales,
        COALESCE(SUM(amount), 0) as today_income
      FROM orders
      WHERE status = 'Completed'
        AND DATE((created_at AT TIME ZONE 'UTC') + INTERVAL '5 hours 30 minutes') = 
            DATE((NOW() AT TIME ZONE 'UTC') + INTERVAL '5 hours 30 minutes')
    `);

    // 3. Last 14 days breakdown
    const dailyRes = await query(`
      SELECT 
        TO_CHAR(DATE((created_at AT TIME ZONE 'UTC') + INTERVAL '5 hours 30 minutes'), 'YYYY-MM-DD') as date_str,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as revenue
      FROM orders
      WHERE status = 'Completed'
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY date_str
      ORDER BY date_str DESC
    `);

    // 4. Recent orders
    const recentRes = await query(`
      SELECT * FROM orders ORDER BY created_at DESC LIMIT 10
    `);

    const totalRow = totalRes.rows[0] || {};
    const todayRow = todayRes.rows[0] || {};

    res.json({
      totalRevenue: Number(totalRow.total_revenue) || 0,
      totalSales: parseInt(totalRow.total_sales, 10) || 0,
      todaySales: parseInt(todayRow.today_sales, 10) || 0,
      todayIncome: Number(todayRow.today_income) || 0,
      uniqueReaders: parseInt(totalRow.unique_readers, 10) || 0,
      dailyBreakdown: dailyRes.rows.map(r => ({
        date: r.date_str,
        count: parseInt(r.count, 10),
        revenue: Number(r.revenue)
      })),
      recentOrders: recentRes.rows.map(formatOrder)
    });
  } catch (err) {
    console.error("Error computing analytics:", err);
    res.status(500).json({ error: "Failed to compute analytics" });
  }
});

// POST /api/orders - Record new order (live or manual)
router.post("/", async (req, res) => {
  try {
    const { name, email, amount, paymentMethod, paymentReference, orderType } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split("@")[0]).trim();
    const finalAmount = Number(amount) > 0 ? Number(amount) : 79;
    const finalMethod = paymentMethod || "UPI";
    const finalType = orderType === "manual" ? "manual" : "live";
    const orderId = "ORD-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

    // 1. Insert order
    const orderResult = await query(
      `INSERT INTO orders (id, name, email, amount, currency, payment_method, payment_reference, status, order_type, created_at)
       VALUES ($1, $2, $3, $4, 'INR', $5, $6, 'Completed', $7, NOW())
       RETURNING *`,
      [orderId, cleanName, cleanEmail, finalAmount, finalMethod, paymentReference || null, finalType]
    );

    // 2. Upsert reader access grant
    await query(
      `INSERT INTO readers (email, name, is_active, granted_at, notes)
       VALUES ($1, $2, TRUE, NOW(), $3)
       ON CONFLICT (email)
       DO UPDATE SET is_active = TRUE, name = EXCLUDED.name`,
      [cleanEmail, cleanName, `Purchased via order ${orderId}`]
    );

    const createdOrder = formatOrder(orderResult.rows[0]);
    res.status(201).json({
      success: true,
      order: createdOrder,
      unlocked: true
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// DELETE /api/orders/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM orders WHERE id = $1", [id]);
    res.json({ success: true, message: `Order ${id} deleted` });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default router;
