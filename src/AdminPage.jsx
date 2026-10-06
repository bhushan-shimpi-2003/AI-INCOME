import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  CreditCard,
  Users,
  Download,
  Search,
  Filter,
  Plus,
  RefreshCw,
  ShieldCheck,
  CheckCircle,
  Copy,
  ExternalLink,
  ArrowUpRight,
  LogOut,
  Trash2,
  Lock,
  Eye,
  Check,
  AlertCircle
} from "lucide-react";

const ORDERS_STORAGE_KEY = "ai_income_orders";
const EMAILS_STORAGE_KEY = "ai_income_purchased_emails";
const CURRENT_USER_KEY = "ai_income_current_user";
const STORAGE_KEY = "ai_income_purchased";

const AUTHOR_EMAILS = [
  "shimpibhushan2503@gmail.com",
  "bhushan.shimpi1@ybl",
  "support@aiincomeguide.com"
];

// Helper to format currency in Indian Rupees
export const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};

// Generates realistic baseline demo orders for the previous 14 days
function generateSeedOrders() {
  const namesAndEmails = [
    { name: "Rahul Sharma", email: "rahul.sharma22@gmail.com" },
    { name: "Pooja Deshmukh", email: "pooja.d.pune@yahoo.com" },
    { name: "Amit Patel", email: "amitpatel.tech@gmail.com" },
    { name: "Sneha Kulkarni", email: "sneha_k@outlook.com" },
    { name: "Vikram Malhotra", email: "vikram.m88@gmail.com" },
    { name: "Neha Verma", email: "neha.verma.work@gmail.com" },
    { name: "Rohan Joshi", email: "rohan.joshi19@gmail.com" },
    { name: "Ananya Iyer", email: "ananya.iyer@gmail.com" },
    { name: "Suresh Pillai", email: "suresh.pillai@rediffmail.com" },
    { name: "Divya Nair", email: "divya.nair.co@gmail.com" },
    { name: "Kunal Bansal", email: "kunal.b@gmail.com" },
    { name: "Priya Sundaram", email: "priya.sundaram@gmail.com" },
    { name: "Aditya Roy", email: "aditya_roy_9@gmail.com" },
    { name: "Manish Chawla", email: "manish.chawla@gmail.com" },
    { name: "Shalini Sen", email: "shalini.sen@gmail.com" },
    { name: "Gaurav Mehta", email: "gaurav_mehta@gmail.com" },
    { name: "Ritu Aggarwal", email: "ritu.aggarwal@gmail.com" },
    { name: "Harish Gupta", email: "harish.g@gmail.com" },
    { name: "Deepak Choudhary", email: "deepak.c.jaipur@gmail.com" },
    { name: "Swati Bhatt", email: "swati.bhatt@gmail.com" }
  ];

  const orders = [];
  const now = new Date();

  // Pattern of daily sales across the last 14 days (today down to 13 days ago)
  const salesDistribution = [8, 11, 7, 10, 6, 9, 8, 5, 7, 6, 4, 5, 3, 4];

  let idCounter = 101;
  salesDistribution.forEach((count, dayOffset) => {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - dayOffset);

    for (let i = 0; i < count; i++) {
      const personIndex = (dayOffset * 3 + i) % namesAndEmails.length;
      const person = namesAndEmails[personIndex];

      const orderHour = 8 + (i * 2) % 14;
      const orderMinute = (i * 17) % 60;
      targetDate.setHours(orderHour, orderMinute, 0, 0);

      orders.push({
        id: `ORD-UPI-${targetDate.getFullYear()}${String(targetDate.getMonth() + 1).padStart(2, "0")}${String(targetDate.getDate()).padStart(2, "0")}-${idCounter++}`,
        name: person.name,
        email: person.email,
        amount: 79,
        currency: "INR",
        paymentMethod: "UPI (bhushan.shimpi1@ybl)",
        date: targetDate.toISOString(),
        status: "Completed",
        type: "demo"
      });
    }
  });

  return orders;
}

export default function AdminPage({ navigate }) {
  const [isAuthed, setIsAuthed] = useState(() => {
    const authStored = sessionStorage.getItem("ai_income_admin_authed");
    const currentUser = localStorage.getItem(CURRENT_USER_KEY) || "";
    return authStored === "true" || AUTHOR_EMAILS.includes(currentUser.toLowerCase());
  });

  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Orders State
  const [orders, setOrders] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY));
      if (stored && Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
    } catch (e) {
      // fallback
    }
    const seed = generateSeedOrders();
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  });

  // Filter & Search states
  const [filterMode, setFilterMode] = useState("all"); // "all" | "live"
  const [dateRange, setDateRange] = useState("14"); // "7" | "14" | "30" | "all"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDayHover, setSelectedDayHover] = useState(null);

  // Manual Order Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Sync back to localStorage if changed
  const saveOrders = (newOrders) => {
    setOrders(newOrders);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(newOrders));
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const clean = pinInput.trim().toLowerCase();
    if (
      clean === "admin79" ||
      clean === "bhushan2026" ||
      clean === "79" ||
      clean === "bhushan" ||
      AUTHOR_EMAILS.includes(clean)
    ) {
      setIsAuthed(true);
      sessionStorage.setItem("ai_income_admin_authed", "true");
      setPinError("");
    } else {
      setPinError("Invalid Admin PIN or Email. Try 'admin79' or 'bhushan2026'.");
    }
  };

  const handleQuickLogin = () => {
    setIsAuthed(true);
    sessionStorage.setItem("ai_income_admin_authed", "true");
    setPinError("");
  };

  const handleAdminLogout = () => {
    setIsAuthed(false);
    sessionStorage.removeItem("ai_income_admin_authed");
  };

  // Filtered orders according to mode ("all" or "live")
  const activeOrders = useMemo(() => {
    if (filterMode === "live") {
      return orders.filter((o) => o.type === "live");
    }
    return orders;
  }, [orders, filterMode]);

  // Calculations for KPIs
  const kpis = useMemo(() => {
    const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.amount || 79), 0);
    const totalSales = activeOrders.length;

    // Today's orders
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = activeOrders.filter((o) => o.date && o.date.slice(0, 10) === todayStr);
    const todayIncome = todayOrders.reduce((sum, o) => sum + (o.amount || 79), 0);
    const todaySales = todayOrders.length;

    // Unique customers
    const uniqueEmails = new Set(activeOrders.map((o) => o.email.toLowerCase()));

    return {
      totalRevenue,
      totalSales,
      todayIncome,
      todaySales,
      uniqueCustomers: uniqueEmails.size
    };
  }, [activeOrders]);

  // Day-wise aggregation
  const daysAnalytics = useMemo(() => {
    const map = new Map();

    activeOrders.forEach((o) => {
      const dayKey = o.date ? o.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
      if (!map.has(dayKey)) {
        map.set(dayKey, {
          dateKey: dayKey,
          count: 0,
          revenue: 0,
          orders: []
        });
      }
      const entry = map.get(dayKey);
      entry.count += 1;
      entry.revenue += o.amount || 79;
      entry.orders.push(o);
    });

    // Sort descending by date
    const sorted = Array.from(map.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey));

    // Limit based on dateRange
    if (dateRange === "7") return sorted.slice(0, 7);
    if (dateRange === "14") return sorted.slice(0, 14);
    if (dateRange === "30") return sorted.slice(0, 30);
    return sorted;
  }, [activeOrders, dateRange]);

  // Chart data: chronological (oldest to newest)
  const chartDays = useMemo(() => {
    return [...daysAnalytics].reverse();
  }, [daysAnalytics]);

  const maxDailyRevenue = useMemo(() => {
    if (chartDays.length === 0) return 1;
    return Math.max(...chartDays.map((d) => d.revenue), 79);
  }, [chartDays]);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return activeOrders.filter((o) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.name && o.name.toLowerCase().includes(q)) ||
        (o.email && o.email.toLowerCase().includes(q)) ||
        (o.date && o.date.includes(q))
      );
    });
  }, [activeOrders, searchQuery]);

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Amount (INR)", "Payment Method", "Status", "Order Type"];
    const rows = filteredPayments.map((o) => [
      `"${o.id || ""}"`,
      `"${o.date || ""}"`,
      `"${(o.name || "").replace(/"/g, '""')}"`,
      `"${o.email || ""}"`,
      o.amount || 79,
      `"${o.paymentMethod || "UPI"}"`,
      `"${o.status || "Completed"}"`,
      `"${o.type || "live"}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ai_income_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manual Order Handler
  const handleAddManualOrder = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualEmail.trim() || !manualEmail.includes("@")) {
      return;
    }

    const cleanEmail = manualEmail.trim().toLowerCase();
    const newOrder = {
      id: `ORD-MANUAL-${Date.now().toString(36).toUpperCase()}`,
      name: manualName.trim(),
      email: cleanEmail,
      amount: 79,
      currency: "INR",
      paymentMethod: "UPI (bhushan.shimpi1@ybl - Manual)",
      date: new Date().toISOString(),
      status: "Completed",
      type: "live"
    };

    // Update orders list
    const updated = [newOrder, ...orders];
    saveOrders(updated);

    // Grant ebook access
    try {
      const storedEmails = JSON.parse(localStorage.getItem(EMAILS_STORAGE_KEY)) || [];
      if (!storedEmails.includes(cleanEmail)) {
        storedEmails.push(cleanEmail);
        localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(storedEmails));
      }
    } catch {}

    setModalSuccess(`✓ Added ₹79 sale & granted access to ${cleanEmail}`);
    setManualName("");
    setManualEmail("");
    setTimeout(() => {
      setModalSuccess("");
      setShowAddModal(false);
    }, 1500);
  };

  // Reset to seed data
  const handleResetSeedData = () => {
    if (window.confirm("Reset dashboard data to default baseline demo records? Your live orders will be refreshed.")) {
      const seed = generateSeedOrders();
      saveOrders(seed);
    }
  };

  const copyToClipboard = (text, id) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Helper date formatter
  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const dayOnly = dateStr.slice(0, 10);

    let prefix = "";
    if (dayOnly === today) prefix = "Today, ";
    else if (dayOnly === yesterday) prefix = "Yesterday, ";

    return (
      prefix +
      d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    );
  };

  // AUTHENTICATION GATE
  if (!isAuthed) {
    return (
      <div className="section animate-page" style={{ minHeight: "85vh", display: "flex", alignItems: "center" }}>
        <div className="container">
          <div className="auth-box animate-fade-up" style={{ maxWidth: 440 }}>
            <div className="auth-header">
              <div className="auth-icon-badge" style={{ background: "var(--color-primary)", color: "#FFFFFF" }}>
                <ShieldCheck size={28} />
              </div>
              <span className="eyebrow">RESTRICTED ACCESS</span>
              <h1 style={{ fontSize: "1.85rem", margin: "6px 0" }}>Admin Dashboard</h1>
              <p style={{ fontSize: "0.92rem", color: "var(--color-secondary)" }}>
                Author & Sales Management Center for <b>Bhushan Shimpi</b>.
              </p>
            </div>

            {pinError && (
              <div className="auth-message error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>{pinError}</div>
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label>Admin Passcode or Author Email</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter passcode (e.g. admin79)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: 14 }}
              >
                <Lock size={16} /> Unlock Dashboard
              </button>

              <div style={{ textAlign: "center", margin: "4px 0" }}>
                <button
                  type="button"
                  className="btn-link"
                  onClick={handleQuickLogin}
                  style={{ fontSize: "0.85rem", color: "var(--color-accent)", justifyContent: "center" }}
                >
                  ⚡ Quick Author Login (Bhushan Shimpi)
                </button>
              </div>

              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 12, textAlign: "center" }}>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => navigate("home")}
                  style={{ fontSize: "0.85rem", color: "var(--color-muted)", justifyContent: "center" }}
                >
                  ← Return to Public Website
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD
  return (
    <div className="admin-layout animate-page">
      {/* Top Banner / Breadcrumb */}
      <div className="admin-header-strip">
        <div className="container admin-header-inner">
          <div className="admin-brand-area">
            <div className="admin-badge-live">
              <span className="live-dot" />
              <span>LIVE REVENUE CENTER</span>
            </div>
            <h1 className="admin-title">AI Income Ebook Dashboard</h1>
            <p className="admin-subtitle">
              Real-time payment tracking, day-wise analytics, and reader orders for <b>bhushan.shimpi1@ybl</b>
            </p>
          </div>

          <div className="admin-actions-bar">
            <button
              className="btn-secondary admin-btn"
              onClick={() => setShowAddModal(true)}
              title="Record an offline or direct UPI sale"
            >
              <Plus size={16} /> Manual Sale
            </button>
            <button
              className="btn-secondary admin-btn"
              onClick={handleExportCSV}
              title="Export all transactions to Excel / CSV"
            >
              <Download size={16} /> Export CSV
            </button>
            <button
              className="btn-primary admin-btn btn-accent"
              onClick={() => navigate("chapter-1")}
              title="Read ebook as author"
            >
              <ExternalLink size={16} /> View Ebook
            </button>
            <button
              className="btn-secondary admin-btn"
              onClick={handleAdminLogout}
              title="Exit Admin Session"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        {/* Dataset Switcher & Controls */}
        <div className="admin-control-bar">
          <div className="admin-filter-pills">
            <button
              className={`pill-btn ${filterMode === "all" ? "active" : ""}`}
              onClick={() => setFilterMode("all")}
            >
              All Sales ({orders.length} orders)
            </button>
            <button
              className={`pill-btn ${filterMode === "live" ? "active" : ""}`}
              onClick={() => setFilterMode("live")}
            >
              Live Orders Only ({orders.filter((o) => o.type === "live").length})
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--color-muted)" }}>
              UPI ID: <b style={{ color: "var(--color-primary)" }}>bhushan.shimpi1@ybl</b> • Rate: <b>₹79/copy</b>
            </span>
            <button
              className="btn-link"
              onClick={handleResetSeedData}
              style={{ fontSize: "0.78rem", color: "var(--color-muted)", padding: "4px 8px" }}
              title="Reset baseline sales data"
            >
              <RefreshCw size={13} /> Reset Baseline
            </button>
          </div>
        </div>

        {/* 4 CORE METRIC CARDS */}
        <div className="admin-stats-grid">
          {/* 1. Total Revenue */}
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-label">TOTAL REVENUE (INCOME)</span>
              <div className="admin-stat-icon" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="admin-stat-value">{formatINR(kpis.totalRevenue)}</div>
            <div className="admin-stat-sub">
              <span className="badge-positive">+100% Direct UPI</span>
              <span>Across {kpis.totalSales} verified copies</span>
            </div>
          </div>

          {/* 2. Total Ebook Sales */}
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-label">TOTAL EBOOKS SOLD</span>
              <div className="admin-stat-icon" style={{ background: "#ECFDF5", color: "#059669" }}>
                <CreditCard size={20} />
              </div>
            </div>
            <div className="admin-stat-value">{kpis.totalSales} copies</div>
            <div className="admin-stat-sub">
              <span className="badge-neutral">₹79 / reader</span>
              <span>All 15 chapters + prompts</span>
            </div>
          </div>

          {/* 3. Today's Income */}
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-label">TODAY'S INCOME</span>
              <div className="admin-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
                <Calendar size={20} />
              </div>
            </div>
            <div className="admin-stat-value">{formatINR(kpis.todayIncome)}</div>
            <div className="admin-stat-sub">
              <span className="badge-positive">Today: {kpis.todaySales} sales</span>
              <span>Active reader traffic</span>
            </div>
          </div>

          {/* 4. Active Readers */}
          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-label">VERIFIED READERS</span>
              <div className="admin-stat-icon" style={{ background: "#F3E8FF", color: "#9333EA" }}>
                <Users size={20} />
              </div>
            </div>
            <div className="admin-stat-value">{kpis.uniqueCustomers}</div>
            <div className="admin-stat-sub">
              <span className="badge-neutral">Zero Refunds</span>
              <span>30-Day guarantee status</span>
            </div>
          </div>
        </div>

        {/* DAY-WISE SALES & INCOME CHART */}
        <div className="admin-card animate-fade-up" style={{ marginTop: 24 }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 size={20} color="var(--color-accent)" />
                Day-Wise Ebook Sales & Income Breakdown
              </h2>
              <p className="admin-card-desc">
                Visual daily revenue performance. Hover or tap any bar to inspect specific day results.
              </p>
            </div>

            <div className="admin-chart-filters">
              <button
                className={`chart-filter-btn ${dateRange === "7" ? "active" : ""}`}
                onClick={() => setDateRange("7")}
              >
                7 Days
              </button>
              <button
                className={`chart-filter-btn ${dateRange === "14" ? "active" : ""}`}
                onClick={() => setDateRange("14")}
              >
                14 Days
              </button>
              <button
                className={`chart-filter-btn ${dateRange === "30" ? "active" : ""}`}
                onClick={() => setDateRange("30")}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Visual Interactive Bar Chart */}
          <div className="admin-chart-stage">
            {chartDays.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-muted)" }}>
                No sales recorded in this view.
              </div>
            ) : (
              <div className="chart-bars-wrap">
                {chartDays.map((d) => {
                  const pct = Math.max((d.revenue / maxDailyRevenue) * 100, 10);
                  const isToday = d.dateKey === new Date().toISOString().slice(0, 10);
                  const isHovered = selectedDayHover?.dateKey === d.dateKey;

                  return (
                    <div
                      key={d.dateKey}
                      className={`chart-col ${isToday ? "is-today" : ""} ${isHovered ? "is-hovered" : ""}`}
                      onMouseEnter={() => setSelectedDayHover(d)}
                      onClick={() => setSelectedDayHover(d)}
                    >
                      <div className="chart-bar-container">
                        <div
                          className="chart-bar-fill"
                          style={{ height: `${pct}%` }}
                        >
                          <span className="chart-bar-amount">{formatINR(d.revenue)}</span>
                        </div>
                      </div>
                      <div className="chart-col-label">
                        {isToday ? "Today" : d.dateKey.slice(5)}
                      </div>
                      <div className="chart-col-count">{d.count} sales</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active / Hover Day Details Banner */}
          <div className="chart-summary-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: "0.9rem", color: "var(--color-primary)", fontWeight: 600 }}>
                {selectedDayHover
                  ? `Selected: ${formatFriendlyDate(selectedDayHover.dateKey)}`
                  : `Average Daily Revenue: ${formatINR(
                      daysAnalytics.length > 0
                        ? Math.round(
                            daysAnalytics.reduce((sum, d) => sum + d.revenue, 0) / daysAnalytics.length
                          )
                        : 0
                    )}`}
              </div>
              {selectedDayHover && (
                <div style={{ fontSize: "0.88rem", color: "var(--color-accent)", fontWeight: 700 }}>
                  {selectedDayHover.count} Copies Sold • {formatINR(selectedDayHover.revenue)} earned
                </div>
              )}
            </div>

            <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
              Data grouped by IST Date (00:00 - 23:59)
            </span>
          </div>
        </div>

        {/* DAY-WISE SUMMARY TABLE */}
        <div className="admin-card animate-fade-up" style={{ marginTop: 24 }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Daily Sales Log (Days-Wise Table)</h2>
              <p className="admin-card-desc">
                Itemized breakdown per day including copies sold, daily income, and volume category.
              </p>
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>
              Showing {daysAnalytics.length} days
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Ebooks Sold</th>
                  <th>Day's Income (₹79/ea)</th>
                  <th>Payment Route</th>
                  <th>Volume Category</th>
                </tr>
              </thead>
              <tbody>
                {daysAnalytics.map((day) => {
                  const isToday = day.dateKey === new Date().toISOString().slice(0, 10);
                  const isPeak = day.count >= 8;

                  return (
                    <tr key={day.dateKey} className={isToday ? "today-row" : ""}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{formatFriendlyDate(day.dateKey)}</span>
                          {isToday && <span className="today-chip">Today</span>}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                          {day.count} {day.count === 1 ? "copy" : "copies"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: "#059669", fontSize: "0.98rem" }}>
                          {formatINR(day.revenue)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "var(--color-secondary)" }}>
                          UPI (bhushan.shimpi1@ybl)
                        </span>
                      </td>
                      <td>
                        {isPeak ? (
                          <span className="status-badge peak">🔥 High Demand</span>
                        ) : (
                          <span className="status-badge steady">✓ Steady</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="table-total-row">
                  <td><b>Totals for Selected Period</b></td>
                  <td>
                    <b>{daysAnalytics.reduce((sum, d) => sum + d.count, 0)} copies</b>
                  </td>
                  <td>
                    <b style={{ color: "#059669", fontSize: "1.05rem" }}>
                      {formatINR(daysAnalytics.reduce((sum, d) => sum + d.revenue, 0))}
                    </b>
                  </td>
                  <td colSpan={2}>100% Direct to Bhushan Shimpi (UPI)</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* PAYMENTS & RECENT TRANSACTIONS TABLE */}
        <div className="admin-card animate-fade-up" style={{ marginTop: 24 }}>
          <div className="admin-card-header" style={{ flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 className="admin-card-title">Recent Payments & Transaction History</h2>
              <p className="admin-card-desc">
                Real-time ledger of individual orders, buyer contact details, and UPI fulfillment status.
              </p>
            </div>

            {/* Search Box */}
            <div className="admin-search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search by name, email, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Route</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "36px 12px", color: "var(--color-muted)" }}>
                      No payments found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredPayments.slice(0, 50).map((order) => {
                    const isNewLive = order.type === "live";

                    return (
                      <tr key={order.id} className={isNewLive ? "live-order-row" : ""}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 600 }}>
                              {order.id}
                            </span>
                            <button
                              className="copy-btn-tiny"
                              onClick={() => copyToClipboard(order.id, order.id)}
                              title="Copy Order ID"
                            >
                              {copiedId === order.id ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                            </button>
                          </div>
                          {isNewLive && <span className="live-pill">LIVE SALE</span>}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>{order.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>{order.email}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: "#059669", fontSize: "0.98rem" }}>
                            ₹{order.amount || 79}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: "0.82rem", color: "var(--color-secondary)" }}>
                            bhushan.shimpi1@ybl
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "0.85rem", color: "var(--color-secondary)" }}>
                            {formatFriendlyDate(order.date)}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                            {order.date ? new Date(order.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </div>
                        </td>
                        <td>
                          <span className="status-badge success">
                            <CheckCircle size={12} /> Completed
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                            onClick={() => copyToClipboard(order.email, `email-${order.id}`)}
                            title="Copy customer email"
                          >
                            {copiedId === `email-${order.id}` ? "Copied" : "Copy Email"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)", fontSize: "0.85rem", color: "var(--color-muted)", flexWrap: "wrap", gap: 10 }}>
            <span>
              Showing {Math.min(filteredPayments.length, 50)} of {filteredPayments.length} total orders
            </span>
            <button className="btn-link" onClick={handleExportCSV} style={{ fontSize: "0.85rem" }}>
              <Download size={14} /> Download complete history as CSV
            </button>
          </div>
        </div>
      </div>

      {/* MANUAL SALE MODAL */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Record Manual UPI Sale</h3>
              <button
                className="btn-link"
                onClick={() => setShowAddModal(false)}
                style={{ fontSize: "1.2rem", color: "var(--color-muted)" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--color-secondary)", marginBottom: 18 }}>
              Use this to record a direct UPI payment (WhatsApp / Telegram / Cash) of ₹79 and instantly grant the reader ebook access.
            </p>

            {modalSuccess && (
              <div className="auth-message success" style={{ marginBottom: 16 }}>
                <Check size={18} />
                <div>{modalSuccess}</div>
              </div>
            )}

            <form onSubmit={handleAddManualOrder} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label>Customer Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Kumar"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Customer Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. ramesh@gmail.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Amount</label>
                <input
                  type="text"
                  className="form-input"
                  value="₹79 (Fixed Ebook Price)"
                  disabled
                  style={{ background: "var(--color-bg-soft)" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="submit"
                  className="btn-primary btn-accent"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <Plus size={16} /> Record Sale & Grant Access
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
