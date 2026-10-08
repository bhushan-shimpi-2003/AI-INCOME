import { ebookSections } from "./ebookContent";

export const SETTINGS_STORAGE_KEY = "ai_income_settings";
export const CHAPTERS_STORAGE_KEY = "ai_income_custom_chapters";

export const LEGAL_DETAILS = {
  legalName: "BHUSHAN KISHOR SHIMPI",
  displayName: "BHUSHAN KISHOR SHIMPI",
  email: "bhushanshimpi2003@gmail.com",
  phone: "+91 7020710581",
  rawPhone: "7020710581",
  bookTitle: "AI Income for Everyone",
  productType: "Digital Educational Ebook & Interactive Web Reader",
  price: 79,
  currency: "INR (₹)",
  deliveryMethod: "Instant Digital Access (Online Web Reader & Email Confirmation)",
  deliveryTime: "Instant / Within 0 to 5 minutes of successful payment",
  refundPeriod: "30 Days from date of purchase",
  refundTurnaround: "5 to 7 business days back to original payment source",
  supportHours: "Monday to Saturday, 9:00 AM – 7:00 PM IST",
  supportTurnaround: "Within 24 to 48 business hours"
};

export const DEFAULT_SETTINGS = {
  bookTitle: "AI Income for Everyone",
  bookSubtitle: "The Practical Blueprint to Earning Extra Income with Free AI Tools",
  authorName: "BHUSHAN KISHOR SHIMPI",
  tagline: "A practical, beginner-friendly guide to earning extra income with AI tools. Designed for students, professionals, and homemakers.",
  upiId: "bhushan.shimpi1@ybl",
  payeeName: "BHUSHAN KISHOR SHIMPI",
  price: 79,
  originalPrice: 499,
  upiNote: "AI Income Ebook - BHUSHAN KISHOR SHIMPI",
  supportEmail: "bhushanshimpi2003@gmail.com",
  supportPhone: "7020710581"
};

export const DEFAULT_CHAPTER_OVERVIEWS = [
  { id: 1, title: "Introduction — You Do Not Need to Be a Tech Person", desc: "A simple, honest starting point for everyday people looking to earn extra income with free AI tools.", readTime: "4 min" },
  { id: 2, title: "Chapter 1 — What AI Can Actually Do for You", desc: "Understanding the four core AI tool categories: chat, image, voice/video, and automation.", readTime: "5 min" },
  { id: 3, title: "Chapter 2 — Your Starter Toolkit", desc: "Setting up your zero-cost starting kit: ChatGPT, Claude, Canva, and free distribution tools.", readTime: "5 min" },
  { id: 4, title: "Chapter 3 — Quick Wins: 5-Minute Methods", desc: "Five practical 5-minute techniques you can use to start earning small amounts right away.", readTime: "6 min" },
  { id: 5, title: "Chapter 4 — Get Paid to Test AI Tools", desc: "How to find and participate in paid testing, evaluation, and feedback programs for AI products.", readTime: "6 min" },
  { id: 6, title: "Chapter 5 — Sell AI-Made Digital Products", desc: "Creating and selling planners, templates, and digital printables on Etsy, Gumroad, and Instamojo.", readTime: "8 min" },
  { id: 7, title: "Chapter 6 — AI Content Creation", desc: "Using AI to write newsletters, blog summaries, and short social posts without losing your personal touch.", readTime: "7 min" },
  { id: 8, title: "Chapter 7 — Freelance Work with AI Help", desc: "Offering high-speed copywriting, graphic design, video editing, and virtual assistant services.", readTime: "9 min" },
  { id: 9, title: "Chapter 8 — Write and Sell Your Own Ebook", desc: "The exact workflow used to outline, write, cover-design, and publish digital guides and books.", readTime: "8 min" },
  { id: 10, title: "Chapter 9 — Help Local Businesses Use AI", desc: "Offering simple AI chatbot setups, review automation, and social media scheduling to local shops.", readTime: "8 min" },
  { id: 11, title: "Chapter 10 — Choosing Your Path", desc: "How to pick a specific market where your AI skills fit your realistic daily routine.", readTime: "5 min" },
  { id: 12, title: "Chapter 11 — Your 30-Day Action Plan with Ready-Made Prompts", desc: "A day-by-day roadmap with specific daily tasks and copy-paste prompt templates.", readTime: "15 min" },
  { id: 13, title: "Resources", desc: "Curated directory of free chat AI, design tools, selling platforms, and freelance websites.", readTime: "3 min" },
  { id: 14, title: "Common Mistakes Beginners Make", desc: "Four critical pitfalls to avoid when starting your AI income journey.", readTime: "3 min" },
  { id: 15, title: "Where to Go Next & Your Next Step", desc: "Final guidance, edition notes, and actionable next steps.", readTime: "3 min" }
];

// Helper to get site settings with fallback
export function getSiteSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure compliance fields are never overwritten by stale cached values
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      if (
        !merged.authorName ||
        merged.authorName === "Bhushan" ||
        merged.authorName === "Bhushan Shimpi"
      ) {
        merged.authorName = DEFAULT_SETTINGS.authorName;
      }
      if (
        !merged.supportEmail ||
        merged.supportEmail === "support@aiincomeguide.com" ||
        merged.supportEmail === "shimpibhushan2503@gmail.com"
      ) {
        merged.supportEmail = DEFAULT_SETTINGS.supportEmail;
      }
      merged.supportPhone = DEFAULT_SETTINGS.supportPhone;
      merged.payeeName = DEFAULT_SETTINGS.payeeName;
      return merged;
    }
  } catch (e) {}
  return DEFAULT_SETTINGS;
}

// Helper to save site settings
export function saveSiteSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("site_settings_updated"));
  } catch (e) {}
}

// Helper to convert blocks array to text format for editing
export function convertBlocksToText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return "";
  return blocks
    .map((b) => {
      if (b.type === "heading") return `### ${b.text}`;
      if (b.type === "bullet") return `- ${b.text}`;
      if (b.type === "number") return `1. ${b.text}`;
      return b.text;
    })
    .join("\n\n");
}

// Helper to convert edited multiline text back into blocks array
export function convertTextToBlocks(text) {
  if (!text) return [];
  const paragraphs = text.split(/\n\s*\n/);
  const blocks = [];

  paragraphs.forEach((para) => {
    const trimmed = para.trim();
    if (!trimmed) return;

    // Check line by line if mixed
    const lines = trimmed.split("\n");
    if (lines.length > 1 && lines.every((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "))) {
      lines.forEach((l) => {
        blocks.push({
          type: "bullet",
          text: l.trim().replace(/^[-*]\s*/, "")
        });
      });
      return;
    }

    if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      blocks.push({
        type: "heading",
        text: trimmed.replace(/^#+\s*/, "")
      });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push({
        type: "bullet",
        text: trimmed.replace(/^[-*]\s*/, "")
      });
    } else if (/^\d+\.\s/.test(trimmed)) {
      blocks.push({
        type: "number",
        text: trimmed.replace(/^\d+\.\s*/, "")
      });
    } else {
      blocks.push({
        type: "p",
        text: trimmed
      });
    }
  });

  return blocks;
}

// Helper to get all 15 chapters (combining manuscript + overrides)
export function getMergedChapters() {
  let customOverrides = {};
  try {
    const raw = localStorage.getItem(CHAPTERS_STORAGE_KEY);
    if (raw) {
      customOverrides = JSON.parse(raw) || {};
    }
  } catch (e) {}

  return DEFAULT_CHAPTER_OVERVIEWS.map((overview, idx) => {
    const defaultSection = ebookSections[idx] || { title: overview.title, blocks: [] };
    const override = customOverrides[overview.id] || {};

    const title = override.title || overview.title;
    const desc = override.desc || overview.desc;
    const readTime = override.readTime || overview.readTime;
    const blocks = override.blocks && Array.isArray(override.blocks) && override.blocks.length > 0
      ? override.blocks
      : defaultSection.blocks;

    return {
      id: overview.id,
      index: idx,
      title,
      desc,
      readTime,
      blocks,
      isCustomized: !!customOverrides[overview.id]
    };
  });
}

// Save a single chapter override
export function saveSingleChapter(chapterId, updatedData) {
  try {
    const raw = localStorage.getItem(CHAPTERS_STORAGE_KEY);
    const customOverrides = raw ? JSON.parse(raw) : {};
    customOverrides[chapterId] = {
      ...(customOverrides[chapterId] || {}),
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CHAPTERS_STORAGE_KEY, JSON.stringify(customOverrides));
    window.dispatchEvent(new Event("chapters_updated"));
    // Asynchronously sync with backend
    saveChapterApi(chapterId, updatedData).catch(() => {});
    return true;
  } catch (e) {
    return false;
  }
}

// Reset single chapter to default
export function resetChapterToDefault(chapterId) {
  try {
    const raw = localStorage.getItem(CHAPTERS_STORAGE_KEY);
    if (raw) {
      const customOverrides = JSON.parse(raw) || {};
      delete customOverrides[chapterId];
      localStorage.setItem(CHAPTERS_STORAGE_KEY, JSON.stringify(customOverrides));
      window.dispatchEvent(new Event("chapters_updated"));
    }
    resetChapterApi(chapterId).catch(() => {});
    return true;
  } catch (e) {
    return false;
  }
}

// Reset all chapters to default
export function resetAllChaptersToDefault() {
  try {
    localStorage.removeItem(CHAPTERS_STORAGE_KEY);
    window.dispatchEvent(new Event("chapters_updated"));
    resetAllChaptersApi().catch(() => {});
    return true;
  } catch (e) {
    return false;
  }
}

// ==========================================
// BACKEND POSTGRESQL API CLIENT
// ==========================================

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json"
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }
    throw new Error(errorData?.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// 1. Settings APIs
export async function fetchSiteSettingsApi() {
  try {
    const data = await apiFetch("/api/settings");
    if (data) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event("site_settings_updated"));
      return data;
    }
  } catch (err) {
    console.warn("Falling back to local site settings:", err.message);
  }
  return getSiteSettings();
}

export async function saveSiteSettingsApi(newSettings) {
  saveSiteSettings(newSettings);
  try {
    const updated = await apiFetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify(newSettings)
    });
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("site_settings_updated"));
    return updated;
  } catch (err) {
    console.error("Failed to sync settings with database:", err);
    return newSettings;
  }
}

// 2. Chapters APIs
export async function fetchChaptersApi() {
  try {
    const chapters = await apiFetch("/api/chapters");
    if (Array.isArray(chapters) && chapters.length > 0) {
      // Update local cache
      const overrides = {};
      chapters.forEach(ch => {
        if (ch.isCustom) {
          overrides[ch.id] = {
            title: ch.title,
            desc: ch.description,
            readTime: ch.readTime,
            blocks: ch.blocks
          };
        }
      });
      localStorage.setItem(CHAPTERS_STORAGE_KEY, JSON.stringify(overrides));
      window.dispatchEvent(new Event("chapters_updated"));
      return chapters;
    }
  } catch (err) {
    console.warn("Falling back to local chapters:", err.message);
  }
  return getMergedChapters();
}

export async function saveChapterApi(chapterId, updatedData) {
  try {
    return await apiFetch(`/api/chapters/${chapterId}`, {
      method: "PUT",
      body: JSON.stringify(updatedData)
    });
  } catch (err) {
    console.error(`Failed to save chapter ${chapterId} to database:`, err);
    throw err;
  }
}

export async function resetChapterApi(chapterId) {
  try {
    return await apiFetch(`/api/chapters/${chapterId}/reset`, {
      method: "POST"
    });
  } catch (err) {
    console.error(`Failed to reset chapter ${chapterId}:`, err);
  }
}

export async function resetAllChaptersApi() {
  try {
    return await apiFetch("/api/chapters/reset-all", {
      method: "POST"
    });
  } catch (err) {
    console.error("Failed to reset all chapters:", err);
  }
}

// 3. Orders & Analytics APIs
export async function fetchOrdersApi() {
  try {
    return await apiFetch("/api/orders");
  } catch (err) {
    console.error("Failed to fetch orders from database:", err);
    return [];
  }
}

export async function fetchAnalyticsApi() {
  try {
    return await apiFetch("/api/orders/analytics");
  } catch (err) {
    console.error("Failed to fetch analytics from database:", err);
    return {
      totalRevenue: 0,
      totalSales: 0,
      todaySales: 0,
      todayIncome: 0,
      uniqueReaders: 0,
      dailyBreakdown: [],
      recentOrders: []
    };
  }
}

export async function createOrderApi(orderData) {
  return await apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderData)
  });
}

export async function deleteOrderApi(orderId) {
  return await apiFetch(`/api/orders/${orderId}`, {
    method: "DELETE"
  });
}

// 4. Readers APIs
export async function fetchReadersApi() {
  try {
    return await apiFetch("/api/readers");
  } catch (err) {
    console.error("Failed to fetch readers:", err);
    return [];
  }
}

export async function verifyReaderAccessApi(email) {
  try {
    return await apiFetch(`/api/readers/verify?email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error("Failed to verify reader access:", err);
    return { unlocked: false, error: err.message };
  }
}

export async function grantReaderApi(email, name, notes) {
  return await apiFetch("/api/readers", {
    method: "POST",
    body: JSON.stringify({ email, name, notes })
  });
}

export async function revokeReaderApi(email) {
  return await apiFetch(`/api/readers/${encodeURIComponent(email)}/revoke`, {
    method: "POST"
  });
}

// 5. Contact Inquiries API
export async function submitContactInquiryApi(formData) {
  return await apiFetch("/api/contact", {
    method: "POST",
    body: JSON.stringify(formData)
  });
}

// 6. Reviews & FAQs APIs
export async function fetchReviewsApi() {
  try {
    return await apiFetch("/api/reviews");
  } catch (err) {
    console.warn("Failed to fetch reviews:", err);
    return [];
  }
}

export async function fetchFaqsApi() {
  try {
    return await apiFetch("/api/faqs");
  } catch (err) {
    console.warn("Failed to fetch FAQs:", err);
    return [];
  }
}
