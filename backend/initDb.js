import { query } from "./db.js";
import { ebookSections } from "../src/ebookContent.js";

const DEFAULT_CHAPTER_OVERVIEWS = [
  { id: 1, title: "Introduction: You Do Not Need to Be a Tech Person", desc: "A simple, honest starting point for everyday people looking to earn extra income with free AI tools.", readTime: "4 min" },
  { id: 2, title: "Chapter 1: What AI Can Actually Do for You", desc: "Understanding the four core AI tool categories: chat, image, voice/video, and automation.", readTime: "5 min" },
  { id: 3, title: "Chapter 2: Your Starter Toolkit", desc: "Setting up your zero-cost starting kit: ChatGPT, Claude, Canva, and free distribution tools.", readTime: "5 min" },
  { id: 4, title: "Chapter 3: Quick Wins: 5-Minute Methods", desc: "Five practical 5-minute techniques you can use to start earning small amounts right away.", readTime: "6 min" },
  { id: 5, title: "Chapter 4: Get Paid to Test AI Tools", desc: "How to find and participate in paid testing, evaluation, and feedback programs for AI products.", readTime: "6 min" },
  { id: 6, title: "Chapter 5: Sell AI-Made Digital Products", desc: "Creating and selling planners, templates, and digital printables on Etsy, Gumroad, and Instamojo.", readTime: "8 min" },
  { id: 7, title: "Chapter 6: AI Content Creation", desc: "Using AI to write newsletters, blog summaries, and short social posts without losing your personal touch.", readTime: "7 min" },
  { id: 8, title: "Chapter 7: Freelance Work with AI Help", desc: "Offering high-speed copywriting, graphic design, video editing, and virtual assistant services.", readTime: "9 min" },
  { id: 9, title: "Chapter 8: Write and Sell Your Own Ebook", desc: "The exact workflow used to outline, write, cover-design, and publish digital guides and books.", readTime: "8 min" },
  { id: 10, title: "Chapter 9: Help Local Businesses Use AI", desc: "Offering simple AI chatbot setups, review automation, and social media scheduling to local shops.", readTime: "8 min" },
  { id: 11, title: "Chapter 10: Choosing Your Path", desc: "How to pick a specific market where your AI skills fit your realistic daily routine.", readTime: "5 min" },
  { id: 12, title: "Chapter 11: Your 30-Day Action Plan with Ready-Made Prompts", desc: "A day-by-day roadmap with specific daily tasks and copy-paste prompt templates.", readTime: "15 min" },
  { id: 13, title: "Resources", desc: "Curated directory of free chat AI, design tools, selling platforms, and freelance websites.", readTime: "3 min" },
  { id: 14, title: "Common Mistakes Beginners Make", desc: "Four critical pitfalls to avoid when starting your AI income journey.", readTime: "3 min" },
  { id: 15, title: "Where to Go Next & Your Next Step", desc: "Final guidance, edition notes, and actionable next steps.", readTime: "3 min" }
];

const DEFAULT_REVIEWS = [
  {
    name: "Aakash Mehta",
    role: "Freelance Copywriter",
    comment: "The prompt templates in Chapter 7 alone helped me double my client output in the first week. Very practical and grounded.",
    rating: 5
  },
  {
    name: "Sneha Rao",
    role: "Homemaker & Creator",
    comment: "I had zero tech experience. Chapter 5 showed me how to make digital budget planners in Canva, and I made my first ₹1,400 sale on Gumroad.",
    rating: 5
  },
  {
    name: "Vikram Malhotra",
    role: "College Student",
    comment: "Clear, straightforward, and zero fluff. The 30-day action plan gives you exactly one small task to do each day.",
    rating: 5
  },
  {
    name: "Pooja Desai",
    role: "Small Business Owner",
    comment: "The chapter on local business AI setup helped me automate my salon's appointment reminders and customer review replies.",
    rating: 5
  },
  {
    name: "Rohan Nair",
    role: "Working Professional",
    comment: "Most AI books are full of abstract theory. This is the only one organized around how much actual free time you have.",
    rating: 5
  },
  {
    name: "Divya Krishnan",
    role: "Content Creator",
    comment: "Extremely well organized. The editorial reader makes it a pleasure to read through on my phone during my daily commute.",
    rating: 5
  }
];

const DEFAULT_FAQS = [
  {
    question: "Do I need technical knowledge or coding skills?",
    answer: "No technical knowledge is required. Every method in the book uses plain English instructions (prompts) and free, user-friendly tools like ChatGPT, Claude, and Canva.",
    display_order: 1
  },
  {
    question: "How will I receive the ebook?",
    answer: "Immediately upon purchase, you will get instant access to the digital reader in your browser, along with a confirmation link sent directly to your email address.",
    display_order: 2
  },
  {
    question: "Is this a one-time payment or a subscription?",
    answer: "It is a one-time payment of ₹79. There are no recurring charges, hidden fees, or subscriptions.",
    display_order: 3
  },
  {
    question: "Can I read it on mobile or tablet?",
    answer: "Yes. The digital reader is fully responsive and optimized for clean, distraction-free reading on smartphones, tablets, laptops, and desktop computers.",
    display_order: 4
  },
  {
    question: "Will I receive future updates to the book?",
    answer: "Yes. As AI tools evolve, the book content is updated periodically. Your purchase includes lifetime access to all future editions and updates at no extra cost.",
    display_order: 5
  },
  {
    question: "Can I get a refund if it's not right for me?",
    answer: "Yes. We offer a full 30-day money-back guarantee. If you go through the material and feel it didn't provide practical value, just send us an email for a prompt refund.",
    display_order: 6
  }
];

export async function initializeDatabase() {
  console.log("--> Initializing PostgreSQL schema...");

  // 1. Site Settings Table
  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INT PRIMARY KEY DEFAULT 1,
      book_title VARCHAR(255) NOT NULL DEFAULT 'AI Income for Everyone',
      book_subtitle TEXT NOT NULL DEFAULT 'The Practical Blueprint to Earning Extra Income with Free AI Tools',
      author_name VARCHAR(255) NOT NULL DEFAULT 'BHUSHAN KISHOR SHIMPI',
      tagline TEXT NOT NULL DEFAULT 'A practical, beginner-friendly guide to earning extra income with AI tools. Designed for students, professionals, and homemakers.',
      upi_id VARCHAR(100) NOT NULL DEFAULT 'bhushan.shimpi1@ybl',
      payee_name VARCHAR(255) NOT NULL DEFAULT 'BHUSHAN KISHOR SHIMPI',
      price NUMERIC(10, 2) NOT NULL DEFAULT 79,
      original_price NUMERIC(10, 2) NOT NULL DEFAULT 499,
      upi_note VARCHAR(255) NOT NULL DEFAULT 'AI Income Ebook - BHUSHAN KISHOR SHIMPI',
      support_email VARCHAR(255) NOT NULL DEFAULT 'bhushanshimpi2003@gmail.com',
      support_phone VARCHAR(50) NOT NULL DEFAULT '7020710581',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Ensure default row exists
  const settingsRes = await query("SELECT id FROM site_settings WHERE id = 1");
  if (settingsRes.rows.length === 0) {
    await query(`
      INSERT INTO site_settings (id, book_title, book_subtitle, author_name, tagline, upi_id, payee_name, price, original_price, upi_note, support_email, support_phone)
      VALUES (1, 'AI Income for Everyone', 'The Practical Blueprint to Earning Extra Income with Free AI Tools', 'BHUSHAN KISHOR SHIMPI', 'A practical, beginner-friendly guide to earning extra income with AI tools. Designed for students, professionals, and homemakers.', 'bhushan.shimpi1@ybl', 'BHUSHAN KISHOR SHIMPI', 79, 499, 'AI Income Ebook - BHUSHAN KISHOR SHIMPI', 'bhushanshimpi2003@gmail.com', '7020710581')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✓ Default site_settings inserted.");
  }

  // 2. Orders Table
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      amount NUMERIC(10, 2) NOT NULL DEFAULT 79,
      currency VARCHAR(10) DEFAULT 'INR',
      payment_method VARCHAR(100) DEFAULT 'UPI',
      payment_reference VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Completed',
      order_type VARCHAR(50) DEFAULT 'live',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (email);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
  `);

  // 3. Readers Table
  await query(`
    CREATE TABLE IF NOT EXISTS readers (
      email VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      notes TEXT
    );
  `);

  // 4. Chapters Table
  await query(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      read_time VARCHAR(50) DEFAULT '5 min',
      blocks JSONB NOT NULL DEFAULT '[]',
      is_custom BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Seed default 15 chapters if empty
  const chaptersCountRes = await query("SELECT COUNT(*) FROM chapters");
  const chapterCount = parseInt(chaptersCountRes.rows[0].count, 10);
  if (chapterCount === 0) {
    console.log("--> Seeding 15 manuscript chapters into PostgreSQL...");
    for (let i = 0; i < ebookSections.length; i++) {
      const section = ebookSections[i];
      const overview = DEFAULT_CHAPTER_OVERVIEWS[i] || {
        id: i + 1,
        title: section.title,
        desc: "",
        readTime: "5 min"
      };
      await query(
        `INSERT INTO chapters (id, title, description, read_time, blocks, is_custom)
         VALUES ($1, $2, $3, $4, $5, FALSE)
         ON CONFLICT (id) DO NOTHING`,
        [
          i + 1,
          section.title,
          overview.desc || "",
          overview.readTime || "5 min",
          JSON.stringify(section.blocks || [])
        ]
      );
    }
    console.log("✓ 15 chapters seeded into PostgreSQL.");
  }

  // 5. Contact Messages Table
  await query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'Unread',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // 6. Reviews Table
  await query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      comment TEXT NOT NULL,
      rating INT DEFAULT 5,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  const reviewsCountRes = await query("SELECT COUNT(*) FROM reviews");
  if (parseInt(reviewsCountRes.rows[0].count, 10) === 0) {
    for (const r of DEFAULT_REVIEWS) {
      await query(
        `INSERT INTO reviews (name, role, comment, rating) VALUES ($1, $2, $3, $4)`,
        [r.name, r.role, r.comment, r.rating]
      );
    }
    console.log("✓ Default reviews seeded.");
  }

  // 7. FAQs Table
  await query(`
    CREATE TABLE IF NOT EXISTS faqs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      display_order INT DEFAULT 0
    );
  `);

  const faqsCountRes = await query("SELECT COUNT(*) FROM faqs");
  if (parseInt(faqsCountRes.rows[0].count, 10) === 0) {
    for (const f of DEFAULT_FAQS) {
      await query(
        `INSERT INTO faqs (question, answer, display_order) VALUES ($1, $2, $3)`,
        [f.question, f.answer, f.display_order]
      );
    }
    console.log("✓ Default FAQs seeded.");
  }

  console.log("✓ PostgreSQL Database successfully initialized and verified!");
}

// Can be run standalone: node backend/initDb.js
if (process.argv[1]?.endsWith("initDb.js")) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Database initialization failed:", err);
      process.exit(1);
    });
}
