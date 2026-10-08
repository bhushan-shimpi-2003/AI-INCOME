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

// GET /api/orders - All orders with optional status filter
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 500, 1000);

    let result;
    if (status) {
      result = await query(
        "SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC LIMIT $2",
        [status, limit]
      );
    } else {
      result = await query(
        "SELECT * FROM orders ORDER BY created_at DESC LIMIT $1",
        [limit]
      );
    }

    res.json(result.rows.map(formatOrder));
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/pending - Specifically get orders waiting for admin approval
router.get("/pending", async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM orders WHERE status = 'Pending' ORDER BY created_at DESC"
    );
    res.json(result.rows.map(formatOrder));
  } catch (err) {
    console.error("Error fetching pending orders:", err);
    res.status(500).json({ error: "Failed to fetch pending orders" });
  }
});

// GET /api/orders/analytics - Real-time sales, income and pending counters
router.get("/analytics", async (req, res) => {
  try {
    // 1. Total KPI aggregates (Completed orders only)
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

    // 3. Pending approvals count
    const pendingRes = await query(`
      SELECT COUNT(*) as pending_count FROM orders WHERE status = 'Pending'
    `);

    // 4. Last 14 days breakdown (Completed only)
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

    // 5. Recent orders
    const recentRes = await query(`
      SELECT * FROM orders ORDER BY created_at DESC LIMIT 15
    `);

    const totalRow = totalRes.rows[0] || {};
    const todayRow = todayRes.rows[0] || {};
    const pendingRow = pendingRes.rows[0] || {};

    res.json({
      totalRevenue: Number(totalRow.total_revenue) || 0,
      totalSales: parseInt(totalRow.total_sales, 10) || 0,
      todaySales: parseInt(todayRow.today_sales, 10) || 0,
      todayIncome: Number(todayRow.today_income) || 0,
      pendingCount: parseInt(pendingRow.pending_count, 10) || 0,
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

// POST /api/orders - Record new order (live with 12-digit UTR, or manual from admin)
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
    const isManual = orderType === "manual";
    const finalType = isManual ? "manual" : "live";
    const finalStatus = isManual ? "Completed" : "Pending";
    const utr = (paymentReference || "").toString().trim();

    // If live checkout, validate 12-digit UTR
    if (!isManual) {
      if (!utr || !/^\d{10,12}$/.test(utr)) {
        return res.status(400).json({
          error: "Please enter a valid 12-digit UPI Transaction Reference (UTR) number."
        });
      }
    }

    const orderId = "ORD-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

    // 1. Insert order
    const orderResult = await query(
      `INSERT INTO orders (id, name, email, amount, currency, payment_method, payment_reference, status, order_type, created_at)
       VALUES ($1, $2, $3, $4, 'INR', $5, $6, $7, $8, NOW())
       RETURNING *`,
      [orderId, cleanName, cleanEmail, finalAmount, finalMethod, utr || null, finalStatus, finalType]
    );

    // 2. Handle reader access
    if (isManual) {
      // Manual sales entered by admin are immediately approved & unlocked
      await query(
        `INSERT INTO readers (email, name, is_active, granted_at, notes)
         VALUES ($1, $2, TRUE, NOW(), $3)
         ON CONFLICT (email)
         DO UPDATE SET is_active = TRUE, name = EXCLUDED.name`,
        [cleanEmail, cleanName, `Manual sale via order ${orderId}`]
      );
    } else {
      // Live checkout submissions are queued for admin approval (inactive reader record created)
      await query(
        `INSERT INTO readers (email, name, is_active, granted_at, notes)
         VALUES ($1, $2, FALSE, NOW(), $3)
         ON CONFLICT (email)
         DO UPDATE SET notes = EXCLUDED.notes`,
        [cleanEmail, cleanName, `Pending UTR approval: ${utr} (Order ${orderId})`]
      );
    }

    const createdOrder = formatOrder(orderResult.rows[0]);
    res.status(201).json({
      success: true,
      order: createdOrder,
      pending: !isManual,
      unlocked: isManual,
      message: isManual
        ? "Order recorded and reader unlocked."
        : "Payment submitted successfully with 12-digit UTR. Awaiting admin approval."
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// POST /api/orders/:id/approve - Admin approves pending payment & unlocks ebook
router.post("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find order
    const orderRes = await query("SELECT * FROM orders WHERE id = $1", [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: `Order ${id} not found` });
    }

    const order = orderRes.rows[0];

    // 2. Update order to Completed
    const updateRes = await query(
      "UPDATE orders SET status = 'Completed' WHERE id = $1 RETURNING *",
      [id]
    );

    // 3. Activate reader access in readers table
    const cleanEmail = order.email.toLowerCase().trim();
    await query(
      `INSERT INTO readers (email, name, is_active, granted_at, notes)
       VALUES ($1, $2, TRUE, NOW(), $3)
       ON CONFLICT (email)
       DO UPDATE SET is_active = TRUE, name = EXCLUDED.name, notes = $3`,
      [cleanEmail, order.name, `Approved payment (UTR: ${order.payment_reference || "N/A"}) for order ${id}`]
    );

    const approvedOrder = formatOrder(updateRes.rows[0]);
    res.json({
      success: true,
      message: `Order ${id} approved successfully! Lifetime ebook access unlocked for ${cleanEmail}.`,
      order: approvedOrder
    });
  } catch (err) {
    console.error("Error approving order:", err);
    res.status(500).json({ error: "Failed to approve order" });
  }
});

// POST /api/orders/:id/reject - Admin rejects payment request
router.post("/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const orderRes = await query("SELECT * FROM orders WHERE id = $1", [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: `Order ${id} not found` });
    }

    const order = orderRes.rows[0];

    // Update order status to Rejected
    const updateRes = await query(
      "UPDATE orders SET status = 'Rejected' WHERE id = $1 RETURNING *",
      [id]
    );

    // Deactivate reader only if no other Completed orders exist
    const cleanEmail = order.email.toLowerCase().trim();
    const otherOrders = await query(
      "SELECT id FROM orders WHERE LOWER(email) = $1 AND status = 'Completed' AND id != $2",
      [cleanEmail, id]
    );

    if (otherOrders.rows.length === 0) {
      await query(
        "UPDATE readers SET is_active = FALSE, notes = $2 WHERE LOWER(email) = $1",
        [cleanEmail, `Rejected order ${id}: ${reason || "Invalid UTR"}`]
      );
    }

    res.json({
      success: true,
      message: `Order ${id} rejected.`,
      order: formatOrder(updateRes.rows[0])
    });
  } catch (err) {
    console.error("Error rejecting order:", err);
    res.status(500).json({ error: "Failed to reject order" });
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
