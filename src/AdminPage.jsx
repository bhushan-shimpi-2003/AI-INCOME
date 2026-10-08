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
  AlertCircle,
  LayoutDashboard,
  BookOpen,
  FileText,
  PlusCircle,
  Settings,
  QrCode,
  Save,
  RotateCcw,
  Edit3,
  Menu,
  X,
  ChevronRight,
  Upload,
  IndianRupee,
  Sparkles
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  getSiteSettings,
  saveSiteSettings,
  getMergedChapters,
  saveSingleChapter,
  resetChapterToDefault,
  resetAllChaptersToDefault,
  convertBlocksToText,
  convertTextToBlocks,
  DEFAULT_SETTINGS
} from "./siteData";

const ORDERS_STORAGE_KEY = "ai_income_orders";
const EMAILS_STORAGE_KEY = "ai_income_purchased_emails";
const CURRENT_USER_KEY = "ai_income_current_user";
const STORAGE_KEY = "ai_income_purchased";

const AUTHOR_EMAILS = [
  "bhushanshimpi2003@gmail.com",
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

// Generates realistic baseline demo orders for previous 14 days
function generateSeedOrders(price = 79) {
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
        amount: price,
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
  // Authentication State
  const [isAuthed, setIsAuthed] = useState(() => {
    const authStored = sessionStorage.getItem("ai_income_admin_authed");
    const currentUser = localStorage.getItem(CURRENT_USER_KEY) || "";
    return authStored === "true" || AUTHOR_EMAILS.includes(currentUser.toLowerCase());
  });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "chapters" | "details" | "pricing" | "readers" | "manual_sale" | "backup"
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(getSiteSettings);
  const [settingsSavedToast, setSettingsSavedToast] = useState("");

  // Chapters State
  const [chapters, setChapters] = useState(getMergedChapters);
  const [selectedChapterId, setSelectedChapterId] = useState(1);
  const [chapterForm, setChapterForm] = useState({
    title: "",
    desc: "",
    readTime: "",
    rawContent: ""
  });
  const [chapterPreviewMode, setChapterPreviewMode] = useState(false);
  const [chapterSaveToast, setChapterSaveToast] = useState("");

  // Orders State
  const [orders, setOrders] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY));
      if (stored && Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
    } catch (e) {}
    const seed = generateSeedOrders(settings.price);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  });

  // Filter & Search states for analytics
  const [filterMode, setFilterMode] = useState("all"); // "all" | "live"
  const [dateRange, setDateRange] = useState("14"); // "7" | "14" | "30" | "all"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDayHover, setSelectedDayHover] = useState(null);

  // Readers State
  const [readerEmails, setReaderEmails] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(EMAILS_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [newReaderEmail, setNewReaderEmail] = useState("");
  const [readerSearch, setReaderSearch] = useState("");

  // Manual Order State
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualToast, setManualToast] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Initialize chapter form when selectedChapterId changes
  useEffect(() => {
    const cur = chapters.find((c) => c.id === selectedChapterId) || chapters[0];
    if (cur) {
      setChapterForm({
        title: cur.title,
        desc: cur.desc,
        readTime: cur.readTime,
        rawContent: convertBlocksToText(cur.blocks)
      });
    }
  }, [selectedChapterId, chapters]);

  // Sync settings when changed from another tab or event
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings(getSiteSettings());
    };
    const handleChaptersUpdate = () => {
      setChapters(getMergedChapters());
    };
    window.addEventListener("site_settings_updated", handleSettingsUpdate);
    window.addEventListener("chapters_updated", handleChaptersUpdate);
    return () => {
      window.removeEventListener("site_settings_updated", handleSettingsUpdate);
      window.removeEventListener("chapters_updated", handleChaptersUpdate);
    };
  }, []);

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

  // Save Settings (Details & Pricing)
  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveSiteSettings(settings);
    setSettingsSavedToast("✓ Settings updated and live across the entire website!");
    setTimeout(() => setSettingsSavedToast(""), 3000);
  };

  // Save Single Chapter
  const handleSaveChapter = (e) => {
    e.preventDefault();
    const blocks = convertTextToBlocks(chapterForm.rawContent);
    saveSingleChapter(selectedChapterId, {
      title: chapterForm.title.trim(),
      desc: chapterForm.desc.trim(),
      readTime: chapterForm.readTime.trim(),
      blocks
    });
    setChapters(getMergedChapters());
    setChapterSaveToast(`✓ Chapter ${selectedChapterId} saved successfully!`);
    setTimeout(() => setChapterSaveToast(""), 3000);
  };

  // Reset Single Chapter
  const handleResetChapter = () => {
    if (window.confirm(`Reset Chapter ${selectedChapterId} to original manuscript?`)) {
      resetChapterToDefault(selectedChapterId);
      setChapters(getMergedChapters());
      setChapterSaveToast(`✓ Chapter ${selectedChapterId} reset to default manuscript.`);
      setTimeout(() => setChapterSaveToast(""), 3000);
    }
  };

  // Reset All Chapters
  const handleResetAllChapters = () => {
    if (window.confirm("Are you sure you want to reset ALL 15 chapters to default manuscript text?")) {
      resetAllChaptersToDefault();
      setChapters(getMergedChapters());
      setChapterSaveToast("✓ All 15 chapters restored to default.");
      setTimeout(() => setChapterSaveToast(""), 3000);
    }
  };

  // Manual Sale Handler
  const handleAddManualSale = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualEmail.trim() || !manualEmail.includes("@")) return;

    const cleanEmail = manualEmail.trim().toLowerCase();
    const newOrder = {
      id: `ORD-MANUAL-${Date.now().toString(36).toUpperCase()}`,
      name: manualName.trim(),
      email: cleanEmail,
      amount: Number(settings.price) || 79,
      currency: "INR",
      paymentMethod: `UPI (${settings.upiId} - Manual)`,
      date: new Date().toISOString(),
      status: "Completed",
      type: "live"
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));

    // Grant access
    try {
      const stored = JSON.parse(localStorage.getItem(EMAILS_STORAGE_KEY)) || [];
      if (!stored.includes(cleanEmail)) {
        stored.push(cleanEmail);
        localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(stored));
        setReaderEmails(stored);
      }
    } catch {}

    setManualToast(`✓ Recorded ₹${settings.price} sale & granted access to ${cleanEmail}`);
    setManualName("");
    setManualEmail("");
    setTimeout(() => setManualToast(""), 3500);
  };

  // Reader Access Management
  const handleAddReader = (e) => {
    e.preventDefault();
    const clean = newReaderEmail.trim().toLowerCase();
    if (!clean || !clean.includes("@")) return;

    if (!readerEmails.includes(clean)) {
      const updated = [...readerEmails, clean];
      setReaderEmails(updated);
      localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updated));
      setNewReaderEmail("");
    }
  };

  const handleRevokeReader = (emailToRevoke) => {
    if (window.confirm(`Revoke reader access for "${emailToRevoke}"?`)) {
      const updated = readerEmails.filter((em) => em !== emailToRevoke);
      setReaderEmails(updated);
      localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // Export System Backup to JSON
  const handleExportSystemBackup = () => {
    const backupData = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      settings: getSiteSettings(),
      customChapters: JSON.parse(localStorage.getItem("ai_income_custom_chapters") || "{}"),
      orders: orders,
      readerEmails: readerEmails
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai_income_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import System Backup
  const handleImportSystemBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.settings) {
          saveSiteSettings(data.settings);
          setSettings(data.settings);
        }
        if (data.customChapters) {
          localStorage.setItem("ai_income_custom_chapters", JSON.stringify(data.customChapters));
          setChapters(getMergedChapters());
        }
        if (data.orders) {
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(data.orders));
          setOrders(data.orders);
        }
        if (data.readerEmails) {
          localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(data.readerEmails));
          setReaderEmails(data.readerEmails);
        }
        alert("✓ System backup restored successfully!");
      } catch (err) {
        alert("Error importing backup file: Invalid JSON format.");
      }
    };
    reader.readAsText(file);
  };

  // Analytics Helpers
  const activeOrders = useMemo(() => {
    if (filterMode === "live") {
      return orders.filter((o) => o.type === "live");
    }
    return orders;
  }, [orders, filterMode]);

  const kpis = useMemo(() => {
    const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.amount || Number(settings.price) || 79), 0);
    const totalSales = activeOrders.length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = activeOrders.filter((o) => o.date && o.date.slice(0, 10) === todayStr);
    const todayIncome = todayOrders.reduce((sum, o) => sum + (o.amount || Number(settings.price) || 79), 0);
    const todaySales = todayOrders.length;
    const uniqueEmails = new Set(activeOrders.map((o) => o.email.toLowerCase()));

    return {
      totalRevenue,
      totalSales,
      todayIncome,
      todaySales,
      uniqueCustomers: uniqueEmails.size
    };
  }, [activeOrders, settings.price]);

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
      entry.revenue += o.amount || Number(settings.price) || 79;
      entry.orders.push(o);
    });

    const sorted = Array.from(map.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    if (dateRange === "7") return sorted.slice(0, 7);
    if (dateRange === "14") return sorted.slice(0, 14);
    if (dateRange === "30") return sorted.slice(0, 30);
    return sorted;
  }, [activeOrders, dateRange, settings.price]);

  const chartDays = useMemo(() => {
    return [...daysAnalytics].reverse();
  }, [daysAnalytics]);

  const maxDailyRevenue = useMemo(() => {
    if (chartDays.length === 0) return 1;
    return Math.max(...chartDays.map((d) => d.revenue), Number(settings.price) || 79);
  }, [chartDays, settings.price]);

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

  const handleExportCSV = () => {
    const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Amount (INR)", "Payment Method", "Status", "Order Type"];
    const rows = filteredPayments.map((o) => [
      `"${o.id || ""}"`,
      `"${o.date || ""}"`,
      `"${(o.name || "").replace(/"/g, '""')}"`,
      `"${o.email || ""}"`,
      o.amount || Number(settings.price) || 79,
      `"${o.paymentMethod || "UPI"}"`,
      `"${o.status || "Completed"}"`,
      `"${o.type || "live"}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai_income_sales_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text, id) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

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

  // UPI URL for live preview
  const liveUpiUrl = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.payeeName)}&am=${encodeURIComponent(settings.price)}&cu=INR&tn=${encodeURIComponent(settings.upiNote)}`;

  // AUTHENTICATION GATE
  if (!isAuthed) {
    return (
      <div className="section animate-page" style={{ minHeight: "100vh", height: "100%", overflowY: "auto", display: "flex", alignItems: "center" }}>
        <div className="container">
          <div className="auth-box animate-fade-up" style={{ maxWidth: 440 }}>
            <div className="auth-header">
              <div className="auth-icon-badge" style={{ background: "var(--color-primary)", color: "#FFFFFF" }}>
                <ShieldCheck size={28} />
              </div>
              <span className="eyebrow">RESTRICTED ACCESS</span>
              <h1 style={{ fontSize: "1.85rem", margin: "6px 0" }}>Admin Suite</h1>
              <p style={{ fontSize: "0.92rem", color: "var(--color-secondary)" }}>
                Author & CMS Management Portal for <b>BHUSHAN KISHOR SHIMPI</b>.
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
                <Lock size={16} /> Unlock Admin Panel
              </button>

              <div style={{ textAlign: "center", margin: "4px 0" }}>
                <button
                  type="button"
                  className="btn-link"
                  onClick={handleQuickLogin}
                  style={{ fontSize: "0.85rem", color: "var(--color-accent)", justifyContent: "center" }}
                >
                  ⚡ Quick Author Login (BHUSHAN KISHOR SHIMPI)
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

  // NAVIGATION TABS CONFIG - CLEAN & SIMPLE
  const navTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "daily_sales", label: "Daily Sales", icon: Calendar },
    { id: "payments", label: "Payments", icon: CreditCard, badge: `${orders.length}` },
    { id: "chapters", label: "Chapters", icon: BookOpen, badge: `${chapters.length}` },
    { id: "pricing", label: "Pricing & UPI", icon: IndianRupee },
    { id: "details", label: "Ebook Details", icon: FileText },
    { id: "readers", label: "Readers", icon: Users, badge: `${readerEmails.length}` },
    { id: "manual_sale", label: "Record Sale", icon: PlusCircle },
    { id: "backup", label: "Backup & Restore", icon: Settings }
  ];

  return (
    <div className="admin-frame-root">
      {/* MOBILE TOP BAR */}
      <div className="admin-mobile-top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="admin-sidebar-burger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle admin sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--color-primary)" }}>
            AI Admin Panel
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.75rem", background: "#ECFDF5", color: "#065F46", padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>
            ₹{settings.price} Live
          </span>
          <button
            className="btn-link"
            onClick={() => navigate("home")}
            style={{ fontSize: "0.8rem", color: "var(--color-accent)" }}
          >
            Store →
          </button>
        </div>
      </div>

      <div className="admin-body-container">
        {/* SIMPLE & PROFESSIONAL SIDEBAR */}
        <aside className={`admin-sidebar-nav ${sidebarOpen ? "open" : ""}`}>
          <div className="admin-sidebar-brand">
            <div className="admin-brand-icon-box">AI</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--color-primary)", lineHeight: 1.2 }}>
                AI Income
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Admin Console
              </div>
            </div>
          </div>

          <nav className="admin-sidebar-menu">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`admin-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon size={17} className="admin-nav-icon" />
                  <span style={{ flex: 1, textAlign: "left" }}>{tab.label}</span>
                  {tab.badge && <span className="admin-nav-badge">{tab.badge}</span>}
                </button>
              );
            })}
          </nav>

          <div className="admin-sidebar-footer">
            <button
              className="admin-sidebar-action-btn"
              onClick={() => navigate("home")}
              title="View Public Storefront"
            >
              <Eye size={15} />
              <span>View Store</span>
            </button>
            <button
              className="admin-sidebar-action-btn danger"
              onClick={handleAdminLogout}
              title="Sign Out of Admin"
            >
              <LogOut size={15} />
              <span>Exit Admin</span>
            </button>
          </div>
        </aside>

        {/* OVERLAY FOR MOBILE SIDEBAR */}
        {sidebarOpen && (
          <div
            className="admin-sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* MAIN WORKSPACE CONTENT */}
        <main className="admin-workspace-pane">
          {/* TAB 1: ANALYTICS DASHBOARD ONLY */}
          {activeTab === "dashboard" && (
            <div className="animate-fade">
              <div className="admin-pane-header">
                <div>
                  <h1 className="admin-pane-title">Revenue & Sales Performance Analytics</h1>
                  <p className="admin-pane-desc">
                    Executive overview of earnings, units sold, growth trajectory, and customer volume.
                  </p>
                </div>
              </div>

              {/* Data Mode Switcher */}
              <div className="admin-control-bar" style={{ marginTop: 20 }}>
                <div className="admin-filter-pills">
                  <button
                    className={`pill-btn ${filterMode === "all" ? "active" : ""}`}
                    onClick={() => setFilterMode("all")}
                  >
                    All Sales ({orders.length} records)
                  </button>
                  <button
                    className={`pill-btn ${filterMode === "live" ? "active" : ""}`}
                    onClick={() => setFilterMode("live")}
                  >
                    Live Orders Only ({orders.filter((o) => o.type === "live").length})
                  </button>
                </div>

                <div style={{ fontSize: "0.82rem", color: "var(--color-muted)" }}>
                  UPI: <b>{settings.upiId}</b> • Selling Price: <b>₹{settings.price}</b>
                </div>
              </div>

              {/* 4 CORE KPI CARDS */}
              {/* 4 CORE KPI CARDS IN A ROW */}
              <div className="admin-stats-grid" style={{ marginTop: 20 }}>
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Total Revenue</span>
                    <div className="admin-stat-icon" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div className="admin-stat-value">{formatINR(kpis.totalRevenue)}</div>
                  <div className="admin-stat-sub">
                    <span className="badge-positive">100% UPI</span>
                    <span>{kpis.totalSales} sales</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Total Ebooks Sold</span>
                    <div className="admin-stat-icon" style={{ background: "#ECFDF5", color: "#059669" }}>
                      <CreditCard size={18} />
                    </div>
                  </div>
                  <div className="admin-stat-value">{kpis.totalSales} copies</div>
                  <div className="admin-stat-sub">
                    <span className="badge-neutral">₹{settings.price} each</span>
                    <span>Direct readers</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Today's Income</span>
                    <div className="admin-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
                      <Calendar size={18} />
                    </div>
                  </div>
                  <div className="admin-stat-value">{formatINR(kpis.todayIncome)}</div>
                  <div className="admin-stat-sub">
                    <span className="badge-positive">{kpis.todaySales} today</span>
                    <span>Live tracker</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Today's Ebooks Sold</span>
                    <div className="admin-stat-icon" style={{ background: "#F3E8FF", color: "#9333EA" }}>
                      <BookOpen size={18} />
                    </div>
                  </div>
                  <div className="admin-stat-value">{kpis.todaySales} copies</div>
                  <div className="admin-stat-sub">
                    <span className="badge-positive">Live Today</span>
                    <span>{formatINR(kpis.todayIncome)} earned</span>
                  </div>
                </div>
              </div>

              {/* DAY-WISE SALES & INCOME CHART */}
              <div className="admin-card" style={{ marginTop: 24 }}>
                <div className="admin-card-header">
                  <div>
                    <h2 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <BarChart3 size={20} color="var(--color-accent)" />
                      Sales Trajectory & Revenue Chart
                    </h2>
                    <p className="admin-card-desc">
                      Interactive timeline visualization. Hover or tap any bar to inspect daily numbers.
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

                <div className="admin-chart-stage">
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
                            <div className="chart-bar-fill" style={{ height: `${pct}%` }}>
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
                </div>

                <div className="chart-summary-footer">
                  <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                    {selectedDayHover
                      ? `Selected: ${formatFriendlyDate(selectedDayHover.dateKey)} — ${selectedDayHover.count} Sales (${formatINR(selectedDayHover.revenue)})`
                      : `Average Daily Income: ${formatINR(
                          daysAnalytics.length > 0
                            ? Math.round(daysAnalytics.reduce((sum, d) => sum + d.revenue, 0) / daysAnalytics.length)
                            : 0
                        )}`}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                    Calculated at ₹{settings.price}/sale
                  </span>
                </div>
              </div>

              {/* QUICK JUMP CARDS TO SEPARATE PAGES */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 24 }}>
                <div
                  className="admin-card"
                  style={{ padding: 24, cursor: "pointer" }}
                  onClick={() => setActiveTab("daily_sales")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Calendar size={20} />
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-accent)", fontWeight: 700 }}>Open Page →</span>
                  </div>
                  <h3 style={{ fontSize: "1.1rem", margin: "0 0 6px 0", color: "var(--color-primary)" }}>Daily Sales Log Table</h3>
                  <p style={{ fontSize: "0.86rem", color: "var(--color-secondary)", margin: 0 }}>
                    View complete day-by-day itemized table showing date-wise volume, earnings, and peak status.
                  </p>
                </div>

                <div
                  className="admin-card"
                  style={{ padding: 24, cursor: "pointer" }}
                  onClick={() => setActiveTab("payments")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CreditCard size={20} />
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-accent)", fontWeight: 700 }}>Open Page →</span>
                  </div>
                  <h3 style={{ fontSize: "1.1rem", margin: "0 0 6px 0", color: "var(--color-primary)" }}>Customer Payments & Logs</h3>
                  <p style={{ fontSize: "0.86rem", color: "var(--color-secondary)", margin: 0 }}>
                    Search, verify, and copy individual buyer records, timestamps, Order IDs, and export CSV.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEPARATE DAILY SALES REPORT PAGE */}
          {activeTab === "daily_sales" && (
            <div className="animate-fade">
              <div className="admin-pane-header">
                <div>
                  <h1 className="admin-pane-title">Daily Sales Report (Day-Wise Summary)</h1>
                  <p className="admin-pane-desc">
                    Itemized daily performance numbers, copy sales volume, and day-by-day revenue generated.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
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
                    <button
                      className={`chart-filter-btn ${dateRange === "all" ? "active" : ""}`}
                      onClick={() => setDateRange("all")}
                    >
                      All Time
                    </button>
                  </div>
                  <button className="btn-secondary" onClick={() => setActiveTab("payments")}>
                    <CreditCard size={15} /> Customer Payments →
                  </button>
                </div>
              </div>

              {/* Daily Sales Telemetry Summary Strip */}
              <div className="admin-stats-grid" style={{ marginTop: 20 }}>
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Total Days Tracked</span>
                    <div className="admin-stat-icon" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
                      <Calendar size={18} />
                    </div>
                  </div>
                  <div className="admin-stat-value">{daysAnalytics.length} days</div>
                  <div className="admin-stat-sub">
                    <span className="badge-neutral">History</span>
                    <span>Continuous tracking</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Average Daily Income</span>
                    <div className="admin-stat-icon" style={{ background: "#ECFDF5", color: "#059669" }}>
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div className="admin-stat-value">
                    {formatINR(daysAnalytics.length > 0 ? Math.round(daysAnalytics.reduce((sum, d) => sum + d.revenue, 0) / daysAnalytics.length) : 0)}
                  </div>
                  <div className="admin-stat-sub">
                    <span className="badge-positive">Per day</span>
                    <span>Daily average</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Period Volume</span>
                    <div className="admin-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
                      <CreditCard size={18} />
                    </div>
                  </div>
                  <div className="admin-stat-value">
                    {daysAnalytics.reduce((sum, d) => sum + d.count, 0)} copies
                  </div>
                  <div className="admin-stat-sub">
                    <span className="badge-neutral">Units</span>
                    <span>Total in timeframe</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-label">Period Earnings</span>
                    <div className="admin-stat-icon" style={{ background: "#F3E8FF", color: "#9333EA" }}>
                      <IndianRupee size={18} />
                    </div>
                  </div>
                  <div className="admin-stat-value">
                    {formatINR(daysAnalytics.reduce((sum, d) => sum + d.revenue, 0))}
                  </div>
                  <div className="admin-stat-sub">
                    <span className="badge-positive">Direct UPI</span>
                    <span>Gross earnings</span>
                  </div>
                </div>
              </div>

              {/* DAY-WISE TABLE */}
              <div className="admin-card" style={{ marginTop: 24 }}>
                <div className="admin-card-header">
                  <div>
                    <h2 className="admin-card-title">Daily Sales Log (Day-Wise Summary)</h2>
                    <p className="admin-card-desc">Itemized daily performance numbers.</p>
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
                        <th>Day's Income (₹{settings.price}/ea)</th>
                        <th>Payment Route</th>
                        <th>Volume Status</th>
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
                              <b>{day.count} copies</b>
                            </td>
                            <td>
                              <span style={{ fontWeight: 800, color: "#059669" }}>
                                {formatINR(day.revenue)}
                              </span>
                            </td>
                            <td style={{ fontSize: "0.82rem", color: "var(--color-secondary)" }}>
                              {settings.upiId}
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
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEPARATE CUSTOMER PAYMENTS & TRANSACTION LOGS PAGE */}
          {activeTab === "payments" && (
            <div className="animate-fade">
              <div className="admin-pane-header">
                <div>
                  <h1 className="admin-pane-title">Customer Payments & Transaction Logs</h1>
                  <p className="admin-pane-desc">
                    Comprehensive audit trail of all customer purchases, verified UPI receipts, and buyer contact details.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="btn-secondary" onClick={handleExportCSV}>
                    <Download size={15} /> Export CSV Spreadsheet
                  </button>
                  <button className="btn-primary btn-accent" onClick={() => setActiveTab("manual_sale")}>
                    <Plus size={15} /> Record Direct Sale
                  </button>
                </div>
              </div>

              {/* Data Mode Switcher */}
              <div className="admin-control-bar" style={{ marginTop: 20 }}>
                <div className="admin-filter-pills">
                  <button
                    className={`pill-btn ${filterMode === "all" ? "active" : ""}`}
                    onClick={() => setFilterMode("all")}
                  >
                    All Purchases ({orders.length})
                  </button>
                  <button
                    className={`pill-btn ${filterMode === "live" ? "active" : ""}`}
                    onClick={() => setFilterMode("live")}
                  >
                    Live Web Purchases ({orders.filter((o) => o.type === "live").length})
                  </button>
                </div>

                <div style={{ fontSize: "0.82rem", color: "var(--color-muted)" }}>
                  Target UPI: <b>{settings.upiId}</b> • Selling Price: <b>₹{settings.price}</b>
                </div>
              </div>

              {/* PAYMENTS TRANSACTIONS TABLE */}
              <div className="admin-card" style={{ marginTop: 20 }}>
                <div className="admin-card-header" style={{ flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <h2 className="admin-card-title">Customer Ledger ({filteredPayments.length} records)</h2>
                    <p className="admin-card-desc">Searchable database of customer transactions and verified receipts.</p>
                  </div>
                  <div className="admin-search-wrap">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="Search by customer name, email, or order ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="search-clear-btn" onClick={() => setSearchQuery("")}>✕</button>
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
                        <th>UPI Target</th>
                        <th>Timestamp</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.slice(0, 60).map((order) => {
                        const isLive = order.type === "live";
                        return (
                          <tr key={order.id} className={isLive ? "live-order-row" : ""}>
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
                              {isLive && <span className="live-pill">LIVE SALE</span>}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{order.name}</div>
                              <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>{order.email}</div>
                            </td>
                            <td>
                              <b style={{ color: "#059669" }}>₹{order.amount || settings.price}</b>
                            </td>
                            <td style={{ fontSize: "0.82rem", color: "var(--color-secondary)" }}>
                              {settings.upiId}
                            </td>
                            <td style={{ fontSize: "0.85rem", color: "var(--color-secondary)" }}>
                              {formatFriendlyDate(order.date)}
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
                              >
                                {copiedId === `email-${order.id}` ? "Copied" : "Copy Email"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: "12px 20px", background: "var(--color-bg-soft)", borderTop: "1px solid var(--color-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", color: "var(--color-muted)" }}>
                  <span>Showing {Math.min(filteredPayments.length, 60)} of {filteredPayments.length} entries</span>
                  <span>Instant verified UPI receipts</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EBOOK CHAPTER EDITOR */}
          {activeTab === "chapters" && (
            <div className="animate-fade">
              <div className="admin-pane-header">
                <div>
                  <h1 className="admin-pane-title">Ebook Chapters & Content Editor</h1>
                  <p className="admin-pane-desc">
                    Modify title, reading time, summary description, and paragraph text for each of the 15 chapters. Changes apply instantly to the public digital reader!
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-secondary" onClick={handleResetAllChapters} title="Restore manuscript">
                    <RotateCcw size={15} /> Reset All to Default
                  </button>
                </div>
              </div>

              {chapterSaveToast && (
                <div className="auth-message success" style={{ marginTop: 16 }}>
                  <Check size={18} />
                  <div>{chapterSaveToast}</div>
                </div>
              )}

              {/* CHAPTER PICKER BAR */}
              <div className="admin-chapter-selector-strip" style={{ marginTop: 20 }}>
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    className={`admin-chapter-tab ${selectedChapterId === ch.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedChapterId(ch.id);
                      setChapterPreviewMode(false);
                    }}
                  >
                    <span className="ch-tab-num">{ch.id === 1 ? "Intro" : `Ch ${ch.id - 1}`}</span>
                    <span className="ch-tab-title">{ch.title.split("—")[0].replace("Chapter ", "Ch ")}</span>
                    {ch.isCustomized && <span className="ch-tab-edited" title="Customized by Author">•</span>}
                  </button>
                ))}
              </div>

              {/* CHAPTER EDIT FORM */}
              <div className="admin-card" style={{ marginTop: 20 }}>
                <div className="admin-card-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="brand-icon" style={{ width: 28, height: 28, fontSize: "0.8rem" }}>
                      {selectedChapterId}
                    </div>
                    <div>
                      <h2 className="admin-card-title" style={{ margin: 0 }}>
                        Editing: Chapter {selectedChapterId} of 15
                      </h2>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                        {chapters.find((c) => c.id === selectedChapterId)?.isCustomized ? "Customized by author" : "Default manuscript content"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className={`pill-btn ${!chapterPreviewMode ? "active" : ""}`}
                      onClick={() => setChapterPreviewMode(false)}
                    >
                      <Edit3 size={13} style={{ marginRight: 4 }} /> Editor
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${chapterPreviewMode ? "active" : ""}`}
                      onClick={() => setChapterPreviewMode(true)}
                    >
                      <Eye size={13} style={{ marginRight: 4 }} /> Live Preview
                    </button>
                  </div>
                </div>

                {!chapterPreviewMode ? (
                  <form onSubmit={handleSaveChapter} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 16 }}>
                      <div className="form-group">
                        <label>Chapter Title *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={chapterForm.title}
                          onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Reading Time *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={chapterForm.readTime}
                          onChange={(e) => setChapterForm({ ...chapterForm, readTime: e.target.value })}
                          placeholder="e.g. 5 min"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Chapter Overview / Short Description (Shows on chapter list & directory)</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={chapterForm.desc}
                        onChange={(e) => setChapterForm({ ...chapterForm, desc: e.target.value })}
                        placeholder="Brief summary of what readers learn in this chapter..."
                      />
                    </div>

                    <div className="form-group">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                        <label style={{ margin: 0 }}>Chapter Full Content (Paragraphs, Headings & Prompts) *</label>
                        <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>
                          Separate paragraphs with blank lines. Prefix with <code>### </code> for headings, <code>- </code> for bullet points.
                        </span>
                      </div>
                      <textarea
                        className="form-input"
                        rows={16}
                        style={{ fontFamily: "inherit", fontSize: "0.95rem", lineHeight: 1.6 }}
                        value={chapterForm.rawContent}
                        onChange={(e) => setChapterForm({ ...chapterForm, rawContent: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--color-border)", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button type="submit" className="btn-primary btn-accent" style={{ padding: "10px 20px" }}>
                          <Save size={16} /> Save Chapter Changes
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => navigate(`chapter-${selectedChapterId}`)}
                        >
                          <ExternalLink size={16} /> View in Live Reader
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn-link"
                        onClick={handleResetChapter}
                        style={{ color: "#DC2626", fontSize: "0.85rem" }}
                      >
                        <RotateCcw size={14} /> Reset This Chapter to Original
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ padding: "30px 24px" }}>
                    <div style={{ maxWidth: 720, margin: "0 auto", background: "#FFFFFF", padding: 24, border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
                      <span className="eyebrow">PREVIEW • CHAPTER {selectedChapterId}</span>
                      <h1 style={{ fontSize: "1.8rem", margin: "10px 0" }}>{chapterForm.title}</h1>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-muted)", marginBottom: 20 }}>
                        Estimated Read Time: {chapterForm.readTime}
                      </div>

                      <div className="reader-article">
                        {convertTextToBlocks(chapterForm.rawContent).map((b, i) => {
                          if (b.type === "heading") return <h3 key={i} style={{ marginTop: 24, marginBottom: 12 }}>{b.text}</h3>;
                          if (b.type === "bullet") return <li key={i} style={{ marginLeft: 20, marginBottom: 6 }}>{b.text}</li>;
                          if (b.type === "number") return <li key={i} style={{ marginLeft: 20, marginBottom: 6 }}><b>{b.text}</b></li>;
                          return <p key={i} style={{ marginBottom: 16, lineHeight: 1.7 }}>{b.text}</p>;
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & UPI SETTINGS */}
          {activeTab === "pricing" && (
            <div className="animate-fade">
              <div className="admin-pane-header">
                <div>
                  <h1 className="admin-pane-title">Payment & Pricing Configuration</h1>
                  <p className="admin-pane-desc">
                    Update your receiving UPI ID, ebook selling price in ₹, and payment note. Changes update all checkout QR codes, intent links, and site prices immediately.
                  </p>
                </div>
              </div>

              {settingsSavedToast && (
                <div className="auth-message success" style={{ marginTop: 16 }}>
                  <Check size={18} />
                  <div>{settingsSavedToast}</div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginTop: 24 }}>
                {/* Form Card */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">UPI & Pricing Details</h2>
                  </div>

                  <form onSubmit={handleSaveSettings} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="form-group">
                      <label>Receiving UPI ID * (Where payments are sent)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={settings.upiId}
                        onChange={(e) => setSettings({ ...settings, upiId: e.target.value.trim() })}
                        placeholder="e.g. bhushan.shimpi1@ybl"
                        required
                      />
                      <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                        Current active UPI handle: <b>{settings.upiId}</b>
                      </span>
                    </div>

                    <div className="form-group">
                      <label>Payee Name * (Displays on GPay / PhonePe / Paytm)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={settings.payeeName}
                        onChange={(e) => setSettings({ ...settings, payeeName: e.target.value })}
                        placeholder="e.g. BHUSHAN KISHOR SHIMPI"
                        required
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div className="form-group">
                        <label>Selling Price (INR ₹) *</label>
                        <input
                          type="number"
                          min="1"
                          className="form-input"
                          value={settings.price}
                          onChange={(e) => setSettings({ ...settings, price: Number(e.target.value) || 79 })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Regular / Strikethrough Price (₹)</label>
                        <input
                          type="number"
                          min="1"
                          className="form-input"
                          value={settings.originalPrice}
                          onChange={(e) => setSettings({ ...settings, originalPrice: Number(e.target.value) || 499 })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>UPI Transaction Note *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={settings.upiNote}
                        onChange={(e) => setSettings({ ...settings, upiNote: e.target.value })}
                        placeholder="e.g. AI Income Ebook - BHUSHAN KISHOR SHIMPI"
                        required
                      />
                    </div>

                    <div style={{ paddingTop: 10 }}>
                      <button type="submit" className="btn-primary btn-accent" style={{ width: "100%", justifyContent: "center", padding: 14 }}>
                        <Save size={16} /> Save Pricing & UPI Settings
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live QR Code & Link Preview */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">Live QR Code & Intent Preview</h2>
                    <span style={{ fontSize: "0.78rem", background: "#ECFDF5", color: "#065F46", padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>
                      Interactive Test
                    </span>
                  </div>

                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
                    <div style={{ padding: 16, background: "#FFFFFF", border: "2px solid var(--color-border)", borderRadius: "var(--radius-lg)", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                      <QRCodeSVG
                        value={liveUpiUrl}
                        size={180}
                        level="M"
                        includeMargin={true}
                      />
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.4rem", color: "#059669" }}>
                        ₹{settings.price}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "var(--color-primary)", fontWeight: 600 }}>
                        {settings.payeeName}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-secondary)" }}>
                        {settings.upiId}
                      </div>
                    </div>

                    <div style={{ padding: 12, background: "var(--color-bg-soft)", borderRadius: "var(--radius-md)", width: "100%", textAlign: "left", fontSize: "0.8rem", color: "var(--color-secondary)", wordBreak: "break-all" }}>
                      <b>Live UPI URL:</b>
                      <div style={{ marginTop: 4, fontFamily: "monospace" }}>{liveUpiUrl}</div>
                    </div>

                    <a
                      href={liveUpiUrl}
                      className="btn-secondary"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Test UPI Intent Link
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EBOOK DETAILS & META */}
          {activeTab === "details" && (
            <div className="animate-fade">
              <div className="admin-pane-header">
                <div>
                  <h1 className="admin-pane-title">Ebook Details & Author Metadata</h1>
                  <p className="admin-pane-desc">
                    Customize the public book title, subtitle, author name, tagline, and support contact.
                  </p>
                </div>
              </div>

              {settingsSavedToast && (
                <div className="auth-message success" style={{ marginTop: 16 }}>
                  <Check size={18} />
                  <div>{settingsSavedToast}</div>
                </div>
              )}

              <div className="admin-card" style={{ marginTop: 24, maxWidth: 740 }}>
                <form onSubmit={handleSaveSettings} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="form-group">
                    <label>Ebook Main Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.bookTitle}
                      onChange={(e) => setSettings({ ...settings, bookTitle: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Ebook Subtitle *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={settings.bookSubtitle}
                      onChange={(e) => setSettings({ ...settings, bookSubtitle: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label>Author / Legal Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={settings.authorName}
                        onChange={(e) => setSettings({ ...settings, authorName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Support Contact Email *</label>
                      <input
                        type="email"
                        className="form-input"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Support Phone Number *</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={settings.supportPhone || "7020710581"}
                        onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tagline / Book Description *</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
                    <button type="submit" className="btn-primary btn-accent" style={{ padding: "12px 24px" }}>
                      <Save size={16} /> Save Ebook Details
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: READERS & ACCESS CONTROL */}
          {activeTab === "readers" && (
            <div className="animate-fade">
              <div className="admin-pane-header">
                <div>
                  <h1 className="admin-pane-title">Reader Accounts & Access Management</h1>
                  <p className="admin-pane-desc">
                    View all customer emails with active lifetime access, grant free/VIP access, or revoke permissions.
                  </p>
                </div>
              </div>

              {/* Add Reader Card */}
              <div className="admin-card" style={{ marginTop: 20 }}>
                <div style={{ padding: "20px 24px" }}>
                  <form onSubmit={handleAddReader} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="Enter reader email address (e.g. reader@gmail.com)..."
                        value={newReaderEmail}
                        onChange={(e) => setNewReaderEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary btn-accent">
                      <Plus size={16} /> Grant Lifetime Access
                    </button>
                  </form>
                </div>
              </div>

              {/* Readers List Table */}
              <div className="admin-card" style={{ marginTop: 24 }}>
                <div className="admin-card-header" style={{ flexWrap: "wrap", gap: 14 }}>
                  <div>
                    <h2 className="admin-card-title">Active Readers Directory ({readerEmails.length})</h2>
                    <p className="admin-card-desc">All verified accounts eligible to read all 15 chapters.</p>
                  </div>

                  <div className="admin-search-wrap">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="Filter readers by email..."
                      value={readerSearch}
                      onChange={(e) => setReaderSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Reader Email</th>
                        <th>Access Level</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readerEmails
                        .filter((em) => em.toLowerCase().includes(readerSearch.toLowerCase()))
                        .map((email, idx) => (
                          <tr key={email}>
                            <td style={{ color: "var(--color-muted)" }}>{idx + 1}</td>
                            <td>
                              <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>{email}</div>
                              {AUTHOR_EMAILS.includes(email.toLowerCase()) && (
                                <span style={{ fontSize: "0.72rem", background: "#EEF2FF", color: "#4F46E5", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                                  Author / Owner
                                </span>
                              )}
                            </td>
                            <td>All 15 Chapters + Prompts</td>
                            <td>
                              <span className="status-badge success">
                                <Check size={12} /> Active
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn-link"
                                style={{ color: "#DC2626", fontSize: "0.82rem" }}
                                onClick={() => handleRevokeReader(email)}
                              >
                                Revoke Access
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MANUAL SALE ENTRY */}
          {activeTab === "manual_sale" && (
            <div className="animate-fade">
              <div className="admin-pane-header">
                <div>
                  <h1 className="admin-pane-title">Record Direct / Offline Sale</h1>
                  <p className="admin-pane-desc">
                    Record a sale made outside the website (via WhatsApp, Telegram, or cash) for ₹{settings.price} and immediately grant reader access.
                  </p>
                </div>
              </div>

              {manualToast && (
                <div className="auth-message success" style={{ marginTop: 16 }}>
                  <Check size={18} />
                  <div>{manualToast}</div>
                </div>
              )}

              <div className="admin-card" style={{ marginTop: 24, maxWidth: 540 }}>
                <form onSubmit={handleAddManualSale} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
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
                    <label>Sale Amount (INR)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={`₹${settings.price} (Configured Selling Price)`}
                      disabled
                      style={{ background: "var(--color-bg-soft)" }}
                    />
                  </div>

                  <div style={{ paddingTop: 10 }}>
                    <button type="submit" className="btn-primary btn-accent" style={{ width: "100%", justifyContent: "center", padding: 14 }}>
                      <PlusCircle size={16} /> Record ₹{settings.price} Sale & Unlock Ebook
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: BACKUP & RESTORE */}
          {activeTab === "backup" && (
            <div className="animate-fade">
              <div className="admin-pane-header">
                <div>
                  <h1 className="admin-pane-title">System Backup & Data Operations</h1>
                  <p className="admin-pane-desc">
                    Export your custom chapter edits, site settings, and orders into an offline JSON backup file, or restore from an earlier backup.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginTop: 24 }}>
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">Export Full System Backup</h2>
                  </div>
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
                    <p style={{ fontSize: "0.88rem", color: "var(--color-secondary)", margin: 0 }}>
                      Downloads all 15 customized chapters, current pricing settings, active readers, and transaction logs in one portable <code>.json</code> file.
                    </p>
                    <button className="btn-primary" onClick={handleExportSystemBackup}>
                      <Download size={16} /> Download Backup (.json)
                    </button>
                  </div>
                </div>

                <div className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">Restore from Backup</h2>
                  </div>
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
                    <p style={{ fontSize: "0.88rem", color: "var(--color-secondary)", margin: 0 }}>
                      Select a previously downloaded <code>.json</code> backup to restore all chapters, pricing, and orders.
                    </p>
                    <label className="btn-secondary" style={{ cursor: "pointer", justifyContent: "center" }}>
                      <Upload size={16} /> Choose Backup File (.json)
                      <input
                        type="file"
                        accept=".json"
                        style={{ display: "none" }}
                        onChange={handleImportSystemBackup}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
