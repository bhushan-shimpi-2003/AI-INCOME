import { ebookSections } from "./ebookContent";

export const SETTINGS_STORAGE_KEY = "ai_income_settings";
export const CHAPTERS_STORAGE_KEY = "ai_income_custom_chapters";

export const DEFAULT_SETTINGS = {
  bookTitle: "AI Income for Everyone",
  bookSubtitle: "The Practical Blueprint to Earning Extra Income with Free AI Tools",
  authorName: "Bhushan Shimpi",
  tagline: "A practical, beginner-friendly guide to earning extra income with AI tools. Designed for students, professionals, and homemakers.",
  upiId: "bhushan.shimpi1@ybl",
  payeeName: "Bhushan Shimpi",
  price: 79,
  originalPrice: 499,
  upiNote: "AI Income Ebook - Bhushan Shimpi",
  supportEmail: "support@aiincomeguide.com"
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
      return { ...DEFAULT_SETTINGS, ...parsed };
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
    return true;
  } catch (e) {
    return false;
  }
}
