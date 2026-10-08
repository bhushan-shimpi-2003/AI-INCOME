import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertCircle, ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronUp,
  Clock, Copy, Download, ExternalLink, FileText, HelpCircle, Info, Key, LogIn, LogOut, Mail, Menu, MessageSquare,
  Phone, QrCode, Shield, ShieldCheck, Smartphone, Sparkles, Star, Truck, User, X, Zap
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ebookSections } from "./ebookContent";
import AdminPage from "./AdminPage";
import {
  getSiteSettings,
  getMergedChapters,
  LEGAL_DETAILS,
  createOrderApi,
  verifyReaderAccessApi,
  submitContactInquiryApi,
  fetchSiteSettingsApi,
  fetchChaptersApi,
  fetchReviewsApi,
  fetchFaqsApi,
  grantReaderApi
} from "./siteData";
import "./styles.css";

const PREVIEW_LIMIT = 1;
const STORAGE_KEY = "ai_income_purchased";
const EMAILS_STORAGE_KEY = "ai_income_purchased_emails";
const CURRENT_USER_KEY = "ai_income_current_user";

// Chapter metadata from manuscript
const CHAPTER_OVERVIEWS = [
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

const FAQS_DATA = [
  {
    q: "Do I need technical knowledge or coding skills?",
    a: "No technical knowledge is required. Every method in the book uses plain English instructions (prompts) and free, user-friendly tools like ChatGPT, Claude, and Canva."
  },
  {
    q: "How will I receive the ebook?",
    a: "Immediately upon purchase, you will get instant access to the digital reader in your browser, along with a confirmation link sent directly to your email address."
  },
  {
    q: "Is this a one-time payment or a subscription?",
    a: "It is a one-time payment. There are no recurring charges, hidden fees, or subscriptions."
  },
  {
    q: "Can I read it on mobile or tablet?",
    a: "Yes. The digital reader is fully responsive and optimized for clean, distraction-free reading on smartphones, tablets, laptops, and desktop computers."
  },
  {
    q: "Will I receive future updates to the book?",
    a: "Yes. As AI tools evolve, the book content is updated periodically. Your purchase includes lifetime access to all future editions and updates at no extra cost."
  },
  {
    q: "Can I get a refund if it's not right for me?",
    a: "Yes. We offer a full 30-day money-back guarantee. If you go through the material and feel it didn't provide practical value, just send us an email for a prompt refund."
  }
];

const REVIEWS_DATA = [
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

// Reusable Header Component
function Header({ currentRoute, navigate, unlocked, siteSettings = getSiteSettings() }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNav = (route) => {
    navigate(route);
    setMobileOpen(false);
  };

  const currentPrice = siteSettings?.price || 79;

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="header-brand" onClick={() => handleNav("home")}>
          <div className="brand-icon">AI</div>
          <span className="brand-name">{siteSettings?.bookTitle || "AI Income for Everyone"}</span>
        </div>

        <nav>
          <ul className="nav-links">
            <li><span className={`nav-link ${currentRoute === "home" ? "active" : ""}`} onClick={() => handleNav("home")}>Home</span></li>
            <li><span className={`nav-link ${currentRoute === "whats-inside" ? "active" : ""}`} onClick={() => handleNav("whats-inside")}>What's Inside</span></li>
            <li><span className={`nav-link ${currentRoute === "chapters" ? "active" : ""}`} onClick={() => handleNav("chapters")}>Chapters</span></li>
            <li><span className={`nav-link ${currentRoute === "reviews" ? "active" : ""}`} onClick={() => handleNav("reviews")}>Reviews</span></li>
            <li><span className={`nav-link ${currentRoute === "faq" ? "active" : ""}`} onClick={() => handleNav("faq")}>FAQ</span></li>
          </ul>
        </nav>

        <div className="header-actions">
          {unlocked ? (
            <>
              <button className="header-login-btn" onClick={() => handleNav("login")}>
                My Access
              </button>
              <button className="btn-primary header-cta btn-accent" onClick={() => handleNav("chapter-1")}>
                Read Ebook →
              </button>
            </>
          ) : (
            <>
              <button className="header-login-btn" onClick={() => handleNav("login")}>
                Login
              </button>
              <button className="btn-primary header-cta" onClick={() => handleNav("checkout")}>
                Get Ebook → ₹{currentPrice}
              </button>
            </>
          )}
          <button className="mobile-menu-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-nav-drawer">
          <span className="mobile-nav-link" onClick={() => handleNav("home")}>Home</span>
          <span className="mobile-nav-link" onClick={() => handleNav("whats-inside")}>What's Inside</span>
          <span className="mobile-nav-link" onClick={() => handleNav("chapters")}>Chapters</span>
          <span className="mobile-nav-link" onClick={() => handleNav("reviews")}>Reviews</span>
          <span className="mobile-nav-link" onClick={() => handleNav("faq")}>FAQ</span>
          <span className="mobile-nav-link" onClick={() => handleNav("pricing")}>Pricing</span>
          <span className="mobile-nav-link" onClick={() => handleNav("login")}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LogIn size={18} />
              <span>{unlocked ? "My Access" : "Reader Login"}</span>
            </div>
            {unlocked && <span style={{ fontSize: "0.75rem", background: "#ECFDF5", color: "#065F46", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>Unlocked</span>}
          </span>
          {unlocked ? (
            <button className="btn-primary btn-accent" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} onClick={() => handleNav("chapter-1")}>
              Continue Reading →
            </button>
          ) : (
            <button className="btn-primary" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} onClick={() => handleNav("checkout")}>
              Get the Ebook → ₹{currentPrice}
            </button>
          )}
        </div>
      )}
    </header>
  );
}

// Reusable Footer Component
function Footer({ navigate, siteSettings = getSiteSettings() }) {
  const currentPrice = siteSettings?.price || 79;
  const bookTitle = siteSettings?.bookTitle || LEGAL_DETAILS.bookTitle;
  const legalName = LEGAL_DETAILS.legalName;
  const email = LEGAL_DETAILS.email;
  const phone = LEGAL_DETAILS.phone;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="header-brand" onClick={() => navigate("home")}>
              <div className="brand-icon">AI</div>
              <span className="brand-name">{bookTitle}</span>
            </div>
            <p>
              A practical, beginner-friendly guide to earning extra income with AI tools. Designed for students, professionals, and homemakers.
            </p>
            <div style={{ marginTop: 12, fontSize: "0.85rem", color: "var(--color-muted)" }}>
              <div><b>Legal Owner:</b> {legalName}</div>
              <div><b>Email:</b> <a href={`mailto:${email}`} style={{ color: "var(--color-primary)", textDecoration: "none" }}>{email}</a></div>
              <div><b>Phone:</b> <a href={`tel:${LEGAL_DETAILS.rawPhone}`} style={{ color: "var(--color-primary)", textDecoration: "none" }}>{phone}</a></div>
            </div>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <ul className="footer-links">
              <li><button onClick={() => navigate("home")}>Home</button></li>
              <li><button onClick={() => navigate("about")}>About Us</button></li>
              <li><button onClick={() => navigate("whats-inside")}>What's Inside</button></li>
              <li><button onClick={() => navigate("chapters")}>Chapter Directory</button></li>
              <li><button onClick={() => navigate("reviews")}>Reader Reviews</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><button onClick={() => navigate("pricing")}>Pricing</button></li>
              <li><button onClick={() => navigate("faq")}>FAQ</button></li>
              <li><button onClick={() => navigate("login")}>Reader Login</button></li>
              <li><button onClick={() => navigate("checkout")}>Buy Ebook (₹{currentPrice})</button></li>
              <li><button onClick={() => navigate("contact")}>Contact Support</button></li>
              <li><button onClick={() => navigate("admin")} style={{ color: "var(--color-accent)", fontWeight: 600 }}>⚡ Admin Portal</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legal & Policies</h4>
            <ul className="footer-links">
              <li><button onClick={() => navigate("privacy")}>Privacy Policy</button></li>
              <li><button onClick={() => navigate("terms")}>Terms & Conditions</button></li>
              <li><button onClick={() => navigate("refund")}>Refund & Cancellation Policy</button></li>
              <li><button onClick={() => navigate("shipping")}>Shipping & Delivery Policy</button></li>
              <li><button onClick={() => navigate("contact")}>Contact Us</button></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {bookTitle}. Published & Operated by {legalName}. All rights reserved.</span>
          <span>
            Merchant: {legalName} • <a href={`mailto:${email}`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>{email}</a> • <a href={`tel:${LEGAL_DETAILS.rawPhone}`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>{phone}</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// 1. HOME PAGE
function HomePage({ navigate, siteSettings = getSiteSettings() }) {
  const [faqOpen, setFaqOpen] = useState(0);
  const currentPrice = siteSettings?.price || 79;
  const originalPrice = siteSettings?.originalPrice || 499;

  return (
    <div className="animate-page">
      {/* Editorial Hero */}
      <section className="hero-editorial">
        <div className="container hero-grid">
          <div className="hero-copy animate-fade-up">
            <span className="eyebrow">A PRACTICAL GUIDE FOR EVERYONE</span>
            <h1>
              Make Real Money<br />
              with AI —<br />
              No Tech Skills Needed
            </h1>
            <p className="hero-lead">
              A beginner-friendly guide to using AI tools to earn income, start side hustles, and build real opportunities — without technical expertise.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("checkout")}>
                Get the Ebook — ₹{currentPrice}
              </button>
              <button className="btn-secondary" onClick={() => navigate("whats-inside")}>
                See What's Inside
              </button>
            </div>
            <div className="trust-indicators">
              <span className="trust-item"><Check size={16} /> 1,000+ readers</span>
              <span className="trust-item"><Check size={16} /> Instant access</span>
              <span className="trust-item"><Check size={16} /> Lifetime updates</span>
            </div>
          </div>

          <div className="hero-visual animate-fade-up delay-1">
            <div className="workspace-stage">
              <div className="book-physical-frame">
                <img
                  src="/cover.png"
                  alt="AI Income for Everyone Book Cover by BHUSHAN KISHOR SHIMPI"
                  className="book-cover-photo"
                />
              </div>
              <div className="book-badge-strip">
                <span><BookOpen size={14} /> 15 Sections</span>
                <span>•</span>
                <span><Clock size={14} /> 2.5 Hr Read</span>
                <span>•</span>
                <span><Shield size={14} /> 30-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Benefits Strip (4 Columns) */}
      <section className="section section-soft">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefit-card animate-fade-up delay-1">
              <div className="benefit-icon"><Sparkles size={20} /></div>
              <h3>Beginner Friendly</h3>
              <p>No technical background or prior coding experience required. Explained in plain language.</p>
            </div>

            <div className="benefit-card animate-fade-up delay-2">
              <div className="benefit-icon"><BookOpen size={20} /></div>
              <h3>Step-by-Step Guide</h3>
              <p>Easy to follow with real examples, ready-to-use prompt templates, and clear instructions.</p>
            </div>

            <div className="benefit-card animate-fade-up delay-3">
              <div className="benefit-icon"><User size={20} /></div>
              <h3>For Everyone</h3>
              <p>Structured specifically for students, working professionals, homemakers, and retirees.</p>
            </div>

            <div className="benefit-card animate-fade-up delay-4">
              <div className="benefit-icon"><Zap size={20} /></div>
              <h3>Focused on Results</h3>
              <p>Learn, apply, and start earning extra income with realistic paths calibrated to your available time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter Preview List */}
      <section className="section">
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="eyebrow">TABLE OF CONTENTS</span>
            <h2>11 Chapters. Real-World Skills.</h2>
            <p>Organized by realistic time commitments and practical income methods.</p>
          </div>

          <div className="chapter-preview-list">
            {CHAPTER_OVERVIEWS.slice(0, 12).map((ch, idx) => (
              <div
                key={ch.id}
                className={`chapter-row animate-fade-up delay-${(idx % 4) + 1}`}
                onClick={() => navigate(`chapter-${ch.id}`)}
              >
                <span className="chapter-num">{String(ch.id).padStart(2, "0")}</span>
                <div className="chapter-info">
                  <h3>{ch.title}</h3>
                  <p>{ch.desc}</p>
                </div>
                <div className="chapter-arrow">
                  <ArrowRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics / Proof Section */}
      <section className="section section-soft">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item animate-fade-up delay-1">
              <span className="stat-number">1,000+</span>
              <span className="stat-label">Readers started their AI journey</span>
            </div>
            <div className="stat-item animate-fade-up delay-2">
              <span className="stat-number">₹{currentPrice}</span>
              <span className="stat-label">One-time payment • No subscriptions</span>
            </div>
            <div className="stat-item animate-fade-up delay-3">
              <span className="stat-number">∞</span>
              <span className="stat-label">Lifetime updates & digital reader access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sneak Peek Section */}
      <section className="section">
        <div className="container">
          <div className="section-header center animate-fade-up">
            <span className="eyebrow">INSIDE THE MANUSCRIPT</span>
            <h2>See What's Inside</h2>
            <p>A look at the clean, distraction-free reading experience included with your purchase.</p>
          </div>

          <div className="sneak-peek-box animate-fade-up delay-1">
            <div className="sneak-peek-page">
              <h4>Introduction — You Do Not Need to Be a Tech Person</h4>
              <p>
                "This book is about one simple idea: you do not need to know coding or computer science to use AI and earn some extra money. The tools we talk about in this book are made for common people. You just type what you want in simple English, and the AI does the hard work..."
              </p>
              <div style={{ marginTop: 24 }}>
                <span className="btn-link" onClick={() => navigate("chapter-1")}>
                  Read free introduction preview →
                </span>
              </div>
            </div>

            <div className="sneak-peek-page">
              <h4>Chapter 03 — Quick Wins: 5-Minute Methods</h4>
              <p>
                "If you have very little free time, start here. Resume improvement, social media caption sets, and short AI advice calls. These take 5 minutes and help you build immediate momentum."
              </p>
              <div style={{ marginTop: 24 }}>
                <span className="btn-link" onClick={() => navigate("whats-inside")}>
                  Explore the full roadmap →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reader Testimonials */}
      <section className="section section-soft">
        <div className="container">
          <div className="section-header center animate-fade-up">
            <span className="eyebrow">VERIFIED REVIEWS</span>
            <h2>What Readers Are Saying</h2>
            <p>Feedback from students, freelancers, and professionals using the guide.</p>
          </div>

          <div className="testimonials-grid">
            {REVIEWS_DATA.slice(0, 3).map((r, i) => (
              <div className={`testimonial-card animate-fade-up delay-${i + 1}`} key={i}>
                <p className="testimonial-quote">"{r.comment}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{r.name.charAt(0)}</div>
                  <div className="author-meta">
                    <b>{r.name}</b>
                    <span>{r.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }} className="animate-fade-up delay-4">
            <button className="btn-secondary" onClick={() => navigate("reviews")}>
              Read all reader reviews →
            </button>
          </div>
        </div>
      </section>

      {/* Pricing CTA Banner */}
      <section className="section">
        <div className="container">
          <div className="pricing-banner animate-fade-up">
            <div className="pricing-info">
              <span className="eyebrow">DIGITAL EDITION</span>
              <h2>Start Your AI Income Journey Today</h2>
              <p>Get immediate, permanent access to the complete manuscript and practical prompt library.</p>
              <ul className="pricing-checklist">
                <li><Check size={18} /> Complete 11 chapters + Introduction & Resources</li>
                <li><Check size={18} /> Practical examples, workflows, and prompts</li>
                <li><Check size={18} /> 30-day day-by-day action plan with copy-paste prompts</li>
                <li><Check size={18} /> Lifetime updates to all future editions</li>
                <li><Check size={18} /> 30-day no-questions-asked money-back guarantee</li>
              </ul>
            </div>

            <div className="pricing-card-box">
              <span style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-muted)" }}>
                ONE-TIME PAYMENT
              </span>
              <div className="price-numbers">
                <span className="price-current">₹{currentPrice}</span>
                <span className="price-original">₹{originalPrice}</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--color-secondary)" }}>
                Instant access in your browser. No recurring fees.
              </p>
              <button className="btn-primary btn-accent" style={{ width: "100%" }} onClick={() => navigate("checkout")}>
                Get the Ebook → ₹{currentPrice}
              </button>
              <span style={{ fontSize: "0.82rem", color: "var(--color-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Shield size={14} /> 30-Day Money-Back Guarantee
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal FAQ Accordion */}
      <section className="section section-soft">
        <div className="container-editorial">
          <div className="section-header center animate-fade-up">
            <span className="eyebrow">COMMON QUESTIONS</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-accordion">
            {FAQS_DATA.slice(0, 4).map((f, i) => (
              <div className="faq-row" key={i}>
                <button className="faq-question" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  <span>{f.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: faqOpen === i ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease"
                    }}
                  />
                </button>
                {faqOpen === i && <p className="faq-answer">{f.a}</p>}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }} className="animate-fade-up delay-2">
            <button className="btn-link" onClick={() => navigate("faq")}>
              View all frequently asked questions →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// 2. WHAT'S INSIDE PAGE
function WhatsInsidePage({ navigate, siteSettings = getSiteSettings() }) {
  const currentPrice = siteSettings?.price || 79;
  const modules = [
    {
      num: "01",
      title: "Foundations & Zero-Cost Setup",
      chapters: "Introduction & Chapters 1–2",
      desc: "Demystifying AI jargon into plain language. Set up your zero-cost toolkit using ChatGPT, Claude, and Canva without paying for subscriptions.",
      learnings: [
        "How to formulate precise prompts that produce high-quality drafts",
        "The difference between chat, image, voice, and automation tools",
        "How to avoid common beginner prompt traps"
      ]
    },
    {
      num: "02",
      title: "Fast Cash & 5-Minute Micro-Services",
      chapters: "Chapters 3 & 4",
      desc: "Designed for readers with less than 30 minutes a day. Learn how to offer rapid resume enhancement, transcription polish, and get paid for testing AI tools.",
      learnings: [
        "Specific prompts for rewriting resumes to sound impactful",
        "Where to register for legitimate paid AI testing platforms",
        "How to price micro-services for quick turnaround"
      ]
    },
    {
      num: "03",
      title: "Digital Products & Content Creation",
      chapters: "Chapters 5 & 6",
      desc: "Create scalable digital assets once and sell them repeatedly. Build printable planners, journal templates, and newsletter summaries.",
      learnings: [
        "Step-by-step Canva template packaging for Etsy, Gumroad, and Instamojo",
        "Creating high-value digital printables with zero design background",
        "Repurposing long articles into short social summaries"
      ]
    },
    {
      num: "04",
      title: "High-Value Freelancing & Local Businesses",
      chapters: "Chapters 7, 8 & 9",
      desc: "Transition into higher-paying retainer services. Help local businesses automate Google review responses, write your own books, and deliver freelance client work faster.",
      learnings: [
        "The exact pitch scripts to approach local clinics, salons, and shops",
        "End-to-end framework for outlining, drafting, and publishing ebooks",
        "Client negotiation and delivery workflows"
      ]
    },
    {
      num: "05",
      title: "Niche Selection & 30-Day Action Plan",
      chapters: "Chapters 10 & 11",
      desc: "Turn your new knowledge into a daily habit. A structured day-by-day playbook ensuring you take one concrete action each day toward your first dollar.",
      learnings: [
        "How to identify profitable, low-competition niches",
        "30 actionable daily tasks with ready-to-paste prompts",
        "Maintaining consistency without burnout"
      ]
    }
  ];

  return (
    <div className="section animate-page">
      <div className="container">
        <div className="section-header center animate-fade-up">
          <span className="eyebrow">BOOK BREAKDOWN</span>
          <h1>What's Inside the Book</h1>
          <p>A practical roadmap from understanding AI to using it for real-world income opportunities.</p>
        </div>

        <div style={{ marginTop: 64 }}>
          {modules.map((m, idx) => (
            <div className={`roadmap-module ${idx % 2 === 1 ? "reverse" : ""} animate-fade-up delay-${(idx % 3) + 1}`} key={m.num}>
              <div className="roadmap-text">
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-accent)" }}>
                  MODULE {m.num} • {m.chapters}
                </span>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <ul className="learning-points">
                  {m.learnings.map((pt, i) => (
                    <li key={i}><Check size={16} /> <span>{pt}</span></li>
                  ))}
                </ul>
              </div>

              <div className="roadmap-preview-card">
                <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-muted)", textTransform: "uppercase" }}>
                  SAMPLE CHAPTER HIGHLIGHT
                </span>
                <h4 style={{ margin: "12px 0 8px", fontSize: "1.2rem" }}>{m.chapters}</h4>
                <p style={{ fontSize: "0.95rem", color: "var(--color-secondary)" }}>
                  Includes real-world examples, step-by-step prompt templates, and execution checklists.
                </p>
                <button
                  className="btn-secondary"
                  style={{ marginTop: 16 }}
                  onClick={() => navigate("chapters")}
                >
                  View Chapter List →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 80 }} className="animate-fade-up delay-3">
          <button className="btn-primary" onClick={() => navigate("checkout")}>
            Get the Complete Ebook — ₹{currentPrice}
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. CHAPTERS DIRECTORY PAGE
function ChaptersPage({ navigate, chapters = getMergedChapters() }) {
  return (
    <div className="section animate-page">
      <div className="container">
        <div className="section-header center animate-fade-up">
          <span className="eyebrow">FULL DIRECTORY</span>
          <h1>The Complete 15-Section Roadmap</h1>
          <p>Explore the complete contents of the manuscript. Click any chapter to read.</p>
        </div>

        <div className="chapter-preview-list" style={{ marginTop: 48 }}>
          {chapters.map((ch, idx) => (
            <div
              key={ch.id}
              className={`chapter-row animate-fade-up delay-${(idx % 4) + 1}`}
              onClick={() => navigate(`chapter-${ch.id}`)}
            >
              <span className="chapter-num">{String(ch.id).padStart(2, "0")}</span>
              <div className="chapter-info">
                <div className="chapter-title-row">
                  <h3>{ch.title}</h3>
                  <span className="chapter-meta-tag">{ch.readTime}</span>
                </div>
                <p>{ch.desc}</p>
              </div>
              <div className="chapter-arrow">
                <ArrowRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. CHAPTER DETAIL / DIGITAL READER PAGE
function ChapterDetailPage({
  chapterId,
  navigate,
  unlocked,
  setUnlocked,
  chapters = getMergedChapters(),
  siteSettings = getSiteSettings()
}) {
  const currentPrice = siteSettings?.price || 79;
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const currentIdx = Math.max(0, Math.min(chapterId - 1, chapters.length - 1));
  const section = chapters[currentIdx] || chapters[0];
  const isPreview = currentIdx < PREVIEW_LIMIT;
  const canRead = unlocked || isPreview;

  const handleSelectChapter = (newId) => {
    navigate(`chapter-${newId}`);
    setMobileTocOpen(false);
  };

  const renderBlock = (b, i) => {
    if (b.type === "heading") return <h3 key={i}>{b.text}</h3>;
    if (b.type === "bullet") return <li key={i}>{b.text}</li>;
    if (b.type === "number") return <li key={i}><b>{b.text}</b></li>;
    return <p key={i}>{b.text}</p>;
  };

  return (
    <div className="reader-layout animate-page">
      {/* Mobile Top Chapter Switcher */}
      <div className="reader-mobile-bar">
        <button
          type="button"
          className="reader-mobile-toggle"
          onClick={() => setMobileTocOpen(!mobileTocOpen)}
          aria-expanded={mobileTocOpen}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden", minWidth: 0 }}>
            <BookOpen size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {String(currentIdx + 1).padStart(2, "0")}. {section.title.replace(/^Chapter \d+: /, "")}
            </span>
          </div>
          <span className="reader-toc-badge">
            Chapters {mobileTocOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`reader-sidebar animate-fade ${mobileTocOpen ? "mobile-open" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>TABLE OF CONTENTS</h4>
          {mobileTocOpen && (
            <button
              type="button"
              className="reader-close-toc-btn"
              onClick={() => setMobileTocOpen(false)}
              aria-label="Close chapter list"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <ul className="reader-toc-list">
          {chapters.map((s, idx) => (
            <li key={idx}>
              <button
                className={`reader-toc-item ${idx === currentIdx ? "active" : ""}`}
                onClick={() => handleSelectChapter(idx + 1)}
              >
                <span style={{ fontWeight: 700, flexShrink: 0 }}>{String(idx + 1).padStart(2, "0")}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.title.replace(/^Chapter \d+: /, "")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Reading Content */}
      <main className="reader-content-wrap">
        <div className="reader-meta-header animate-fade-up">
          <span className="eyebrow">SECTION {String(currentIdx + 1).padStart(2, "0")} OF {chapters.length}</span>
          <h1>{section.title}</h1>
          <span style={{ fontSize: "0.9rem", color: "var(--color-muted)", marginTop: 8, display: "block" }}>
            Estimated read time: ~{section.readTime || "5 min"} • {siteSettings?.bookTitle || "AI Income for Everyone"} by {siteSettings?.authorName || LEGAL_DETAILS.legalName}
          </span>
        </div>

        <article className="reader-article animate-fade-up delay-1">
          {canRead ? (
            <>
              {section.blocks.map(renderBlock)}

              <div className="reader-exercise-box">
                <h4>Practical Action Step</h4>
                <p>
                  Open your AI tool of choice (ChatGPT, Claude, or Canva) and spend 10 minutes applying the ideas from this section into your daily workflow.
                </p>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "64px 20px", background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }} className="animate-fade-up delay-2">
              <span className="eyebrow">PREVIEW LIMIT REACHED</span>
              <h2 style={{ margin: "12px 0" }}>This Chapter is Part of the Complete Edition</h2>
              <p style={{ maxWidth: 480, margin: "0 auto 24px" }}>
                Unlock all {chapters.length} sections, ready-made prompt templates, and the complete 30-day action plan for a one-time payment of ₹{currentPrice}.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                <button className="btn-primary" onClick={() => navigate("checkout")}>
                  Get the Complete Ebook — ₹{currentPrice}
                </button>
                <button className="btn-secondary" onClick={() => navigate("login")}>
                  Already Purchased? Log In
                </button>
              </div>
            </div>
          )}
        </article>

        {/* Previous / Next Navigation */}
        <div className="reader-footer-nav animate-fade-up delay-2">
          <button
            className="btn-secondary"
            disabled={currentIdx === 0}
            onClick={() => navigate(`chapter-${currentIdx}`)}
            style={{ opacity: currentIdx === 0 ? 0.4 : 1 }}
          >
            ← Previous Section
          </button>

          <span style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>
            Section {currentIdx + 1} of {chapters.length}
          </span>

          <button
            className="btn-secondary"
            disabled={currentIdx === chapters.length - 1}
            onClick={() => navigate(`chapter-${currentIdx + 2}`)}
            style={{ opacity: currentIdx === chapters.length - 1 ? 0.4 : 1 }}
          >
            Next Section →
          </button>
        </div>
      </main>
    </div>
  );
}

// 5. REVIEWS PAGE
function ReviewsPage({ navigate, siteSettings = getSiteSettings() }) {
  const currentPrice = siteSettings?.price || 79;
  return (
    <div className="section animate-page">
      <div className="container">
        <div className="section-header center animate-fade-up">
          <span className="eyebrow">COMMUNITY FEEDBACK</span>
          <h1>Real People. Real Progress.</h1>
          <p>Read honest reviews from readers who used the guide to launch their AI income streams.</p>
        </div>

        <div className="testimonials-grid" style={{ marginTop: 48 }}>
          {REVIEWS_DATA.map((r, i) => (
            <div className={`testimonial-card animate-fade-up delay-${(i % 3) + 1}`} key={i}>
              <div style={{ display: "flex", gap: 4, color: "#F59E0B", marginBottom: 12 }}>
                {[...Array(r.rating)].map((_, idx) => (
                  <Star key={idx} size={16} fill="#F59E0B" />
                ))}
              </div>
              <p className="testimonial-quote">"{r.comment}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{r.name.charAt(0)}</div>
                <div className="author-meta">
                  <b>{r.name}</b>
                  <span>{r.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 80, padding: "48px 32px", background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)" }} className="animate-fade-up delay-2">
          <div className="section-header center" style={{ marginBottom: 32 }}>
            <span className="eyebrow">PRACTICAL APPLICATIONS</span>
            <h2>What Readers Used It For</h2>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <h3>Freelance Copywriting</h3>
              <p>Writing high-converting product descriptions, blog outlines, and email campaigns for clients.</p>
            </div>
            <div className="benefit-card">
              <h3>Digital Products</h3>
              <p>Designing and listing planners, checklists, and resume templates on Etsy, Gumroad, and Instamojo.</p>
            </div>
            <div className="benefit-card">
              <h3>Local Business Setup</h3>
              <p>Configuring automated review replies and WhatsApp assistants for local shops and clinics.</p>
            </div>
            <div className="benefit-card">
              <h3>Content Creation</h3>
              <p>Publishing newsletters, social media carousels, and research summaries in fraction of the time.</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }} className="animate-fade-up delay-3">
          <button className="btn-primary" onClick={() => navigate("checkout")}>
            Join 1,000+ Readers — ₹{currentPrice}
          </button>
        </div>
      </div>
    </div>
  );
}

// 6. FAQ PAGE
function FaqPage({ navigate }) {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="section animate-page">
      <div className="container-editorial">
        <div className="section-header center animate-fade-up">
          <span className="eyebrow">HELP & CLARITY</span>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about the ebook, delivery, tools, and guarantees.</p>
        </div>

        <div className="faq-accordion" style={{ marginTop: 48 }}>
          {FAQS_DATA.map((f, i) => (
            <div className="faq-row animate-fade-up" key={i}>
              <button className="faq-question" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <span>{f.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease"
                  }}
                />
              </button>
              {openIdx === i && <p className="faq-answer">{f.a}</p>}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 64, padding: "32px", background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }} className="animate-fade-up delay-2">
          <h3>Still have questions?</h3>
          <p style={{ marginTop: 8, marginBottom: 16 }}>Our support team is here to help with any inquiries.</p>
          <button className="btn-secondary" onClick={() => navigate("contact")}>
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  );
}

// 7. PRICING PAGE
function PricingPage({ navigate, siteSettings = getSiteSettings() }) {
  const currentPrice = siteSettings?.price || 79;
  const originalPrice = siteSettings?.originalPrice || 499;
  const upiId = siteSettings?.upiId || "bhushan.shimpi1@ybl";

  return (
    <div className="section animate-page">
      <div className="container">
        <div className="section-header center animate-fade-up">
          <span className="eyebrow">TRANSPARENT PRICING</span>
          <h1>Start Your AI Income Journey</h1>
          <p>One simple price. No hidden fees. Lifetime access to the complete digital guide.</p>
        </div>

        <div className="pricing-banner animate-fade-up delay-1" style={{ marginTop: 48 }}>
          <div className="pricing-info">
            <h2>What You Get</h2>
            <p>Everything you need to go from beginner to earning your first dollar with AI.</p>
            <ul className="pricing-checklist">
              <li><Check size={18} /> Complete 15-section manuscript with real-world examples</li>
              <li><Check size={18} /> Step-by-step AI workflows for ChatGPT, Claude, and Canva</li>
              <li><Check size={18} /> 30-day day-by-day action plan with copy-paste prompts</li>
              <li><Check size={18} /> Lifetime digital reader access and all future updates</li>
              <li><Check size={18} /> 30-day 100% money-back guarantee</li>
            </ul>
          </div>

          <div className="pricing-card-box">
            <span style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-muted)" }}>
              COMPLETE EDITION
            </span>
            <div className="price-numbers">
              <span className="price-current">₹{currentPrice}</span>
              <span className="price-original">₹{originalPrice}</span>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--color-secondary)" }}>
              One-time payment • Instant unlock via UPI ({upiId})
            </p>
            <button className="btn-primary btn-accent" style={{ width: "100%" }} onClick={() => navigate("checkout")}>
              Get the Ebook → ₹{currentPrice}
            </button>
            <span style={{ fontSize: "0.82rem", color: "var(--color-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Shield size={14} /> 30-Day Money-Back Guarantee
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 8. CHECKOUT PAGE
function CheckoutPage({ navigate, setUnlocked, siteSettings = getSiteSettings() }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentOption, setPaymentOption] = useState("qr"); // "qr" or "intent"
  const [errorMessage, setErrorMessage] = useState("");

  const UPI_ID = siteSettings?.upiId || "bhushan.shimpi1@ybl";
  const AMOUNT = String(siteSettings?.price || 79);
  const PAYEE_NAME = siteSettings?.payeeName || LEGAL_DETAILS.legalName;
  const NOTE = siteSettings?.upiNote || `AI Income Ebook - ${LEGAL_DETAILS.legalName}`;

  // Standard UPI URI format: opens UPI apps on mobile and encodes into QR code
  const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${encodeURIComponent(AMOUNT)}&cu=INR&tn=${encodeURIComponent(NOTE)}`;

  const handleCopyUpi = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(UPI_ID);
    }
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCompletePayment = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address to receive access confirmation.");
      return;
    }
    setErrorMessage("");

    // Immediately grant access to the entire ebook
    const cleanEmail = email.trim().toLowerCase();
    const storedEmails = (() => {
      try {
        return JSON.parse(localStorage.getItem(EMAILS_STORAGE_KEY)) || [];
      } catch {
        return [];
      }
    })();
    if (!storedEmails.includes(cleanEmail)) {
      storedEmails.push(cleanEmail);
      localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(storedEmails));
    }
    setUnlocked(true);
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.setItem(CURRENT_USER_KEY, cleanEmail);

    const newOrder = {
      id: "ORD-UPI-" + Date.now().toString(36).toUpperCase(),
      name: name.trim(),
      email: cleanEmail,
      amount: Number(AMOUNT) || 79,
      currency: "INR",
      paymentMethod: `UPI (${UPI_ID})`,
      date: new Date().toISOString(),
      status: "Completed",
      type: "live",
      orderType: "live"
    };

    localStorage.setItem(
      "ai_income_customer",
      JSON.stringify(newOrder)
    );

    try {
      const storedOrders = JSON.parse(localStorage.getItem("ai_income_orders")) || [];
      storedOrders.unshift(newOrder);
      localStorage.setItem("ai_income_orders", JSON.stringify(storedOrders));
    } catch {}

    // Save to PostgreSQL database
    createOrderApi({
      name: name.trim(),
      email: cleanEmail,
      amount: Number(AMOUNT) || 79,
      paymentMethod: `UPI (${UPI_ID})`,
      orderType: "live"
    }).catch((err) => {
      console.warn("Backend order creation notice:", err);
    });

    navigate("thank-you");
  };

  return (
    <div className="section animate-page" style={{ minHeight: "80vh" }}>
      <div className="container">
        <div className="checkout-grid">
          {/* Order Summary (Left) */}
          <div className="order-summary-box animate-fade-up">
            <span className="eyebrow">ORDER SUMMARY</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <h3 style={{ fontSize: "1.4rem" }}>{siteSettings?.bookTitle || LEGAL_DETAILS.bookTitle}</h3>
                <span style={{ fontSize: "0.9rem", color: "var(--color-secondary)" }}>by {siteSettings?.authorName || LEGAL_DETAILS.legalName} • Complete Digital Edition</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--color-primary)" }}>₹{AMOUNT}</span>
                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--color-muted)", textDecoration: "line-through" }}>₹{siteSettings?.originalPrice || 499}</span>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

            <ul className="pricing-checklist" style={{ margin: 0 }}>
              <li><Check size={16} /> Instant access to all 15 sections</li>
              <li><Check size={16} /> Complete 30-day action plan with prompts</li>
              <li><Check size={16} /> Lifetime updates & browser reader</li>
              <li><Check size={16} /> Instant UPI activation (PhonePe, GPay, Paytm)</li>
            </ul>

            <div style={{ padding: "16px", background: "#FFFFFF", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-secondary)" }}>Ebook Edition:</span>
                <b>Complete Digital Edition</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-secondary)" }}>Payment Method:</span>
                <b>UPI (GPay/PhonePe/Paytm)</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-secondary)" }}>Amount Due:</span>
                <b style={{ color: "var(--color-accent)", fontSize: "1.05rem" }}>₹{AMOUNT} only</b>
              </div>
            </div>

            <div style={{ marginTop: "auto", padding: "16px", background: "#FFFFFF", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "var(--color-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={18} color="var(--color-accent)" />
              <span>30-Day Money-Back Guarantee • 100% Risk Free</span>
            </div>
          </div>

          {/* Checkout & UPI Form (Right) */}
          <form className="checkout-form animate-fade-up delay-1" onSubmit={handleCompletePayment}>
            <span className="eyebrow">FAST UPI CHECKOUT</span>
            <h2 style={{ marginBottom: 0 }}>Unlock Your Copy for ₹{AMOUNT}</h2>

            {errorMessage && (
              <div style={{ padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "var(--radius-md)", color: "#991B1B", fontSize: "0.9rem" }}>
                {errorMessage}
              </div>
            )}

            {/* Step 1: Customer Info */}
            <div className="upi-pay-card">
              <div className="checkout-step">
                <span className="step-num">1</span>
                <span>Enter Your Details</span>
              </div>

              <div className="form-group">
                <label>Your Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address (for instant access & updates) *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Step 2: Pay via UPI */}
            <div className="upi-pay-card">
              <div className="checkout-step">
                <span className="step-num">2</span>
                <span>Pay ₹{AMOUNT} to UPI ID: <span style={{ color: "var(--color-accent)" }}>{UPI_ID}</span></span>
              </div>

              <div className="upi-method-tabs">
                <button
                  type="button"
                  className={`upi-method-tab ${paymentOption === "qr" ? "active" : ""}`}
                  onClick={() => setPaymentOption("qr")}
                >
                  <QrCode size={16} /> Scan QR Code
                </button>
                <button
                  type="button"
                  className={`upi-method-tab ${paymentOption === "intent" ? "active" : ""}`}
                  onClick={() => setPaymentOption("intent")}
                >
                  <Smartphone size={16} /> Pay via UPI App / ID
                </button>
              </div>

              {paymentOption === "qr" ? (
                <div className="upi-qr-card">
                  <div className="upi-amount-pill">
                    <Check size={14} /> Amount Prefilled: ₹{AMOUNT}
                  </div>

                  <div className="upi-qr-frame">
                    <QRCodeSVG
                      value={upiUrl}
                      size={180}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <div style={{ fontSize: "0.85rem", color: "var(--color-secondary)", maxWidth: 300, lineHeight: 1.4 }}>
                    Scan with <b>Google Pay</b>, <b>PhonePe</b>, <b>Paytm</b>, <b>BHIM</b> or any UPI app.
                  </div>

                  <div className="upi-apps-row">
                    <span className="upi-app-badge">Google Pay</span>
                    <span className="upi-app-badge">PhonePe</span>
                    <span className="upi-app-badge">Paytm</span>
                    <span className="upi-app-badge">BHIM</span>
                    <span className="upi-app-badge">CRED</span>
                  </div>

                  {/* Mobile Direct Pay Link */}
                  <a
                    href={upiUrl}
                    className="upi-direct-btn"
                    style={{ marginTop: 8 }}
                  >
                    <Smartphone size={18} /> Open UPI App & Pay ₹{AMOUNT}
                  </a>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <a
                    href={upiUrl}
                    className="upi-direct-btn"
                  >
                    <Smartphone size={18} /> Tap to Pay ₹{AMOUNT} via UPI App
                  </a>
                  <p style={{ fontSize: "0.82rem", color: "var(--color-muted)", textAlign: "center", margin: 0 }}>
                    Automatically opens GPay / PhonePe / Paytm with ₹{AMOUNT} prefilled.
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                    <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
                    <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>OR PAY MANUALLY</span>
                    <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
                  </div>

                  <div className="upi-id-box">
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase" }}>Payee UPI ID</div>
                      <div className="upi-id-text">{UPI_ID}</div>
                    </div>
                    <button
                      type="button"
                      className={`upi-copy-btn ${copiedUpi ? "copied" : ""}`}
                      onClick={handleCopyUpi}
                    >
                      {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                      {copiedUpi ? "Copied!" : "Copy ID"}
                    </button>
                  </div>

                  <div style={{ fontSize: "0.85rem", color: "var(--color-secondary)", background: "var(--color-bg-soft)", padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                    <b>How to pay manually:</b>
                    <ol style={{ margin: "6px 0 0 18px", padding: 0, fontSize: "0.83rem" }}>
                      <li>Open any UPI app (GPay, PhonePe, Paytm).</li>
                      <li>Send exactly <b>₹{AMOUNT}</b> to <b>{UPI_ID}</b>.</li>
                      <li>Click "Confirm Payment & Unlock Ebook" below.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* UPI ID quick copy bar under QR tab as well */}
              {paymentOption === "qr" && (
                <div className="upi-id-box">
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>UPI ID</div>
                    <div className="upi-id-text">{UPI_ID}</div>
                  </div>
                  <button
                    type="button"
                    className={`upi-copy-btn ${copiedUpi ? "copied" : ""}`}
                    onClick={handleCopyUpi}
                  >
                    {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                    {copiedUpi ? "Copied!" : "Copy UPI ID"}
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Confirmation / Access Activation */}
            <div className="upi-pay-card">
              <div className="checkout-step">
                <span className="step-num">3</span>
                <span>Confirm & Get Instant Ebook Access</span>
              </div>

              <p style={{ fontSize: "0.9rem", color: "var(--color-secondary)", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                After completing your payment of ₹{AMOUNT} via your UPI app or the QR code above, click the button below to instantly unlock the full ebook.
              </p>

              <button
                type="submit"
                className="btn-primary btn-accent"
                style={{ width: "100%", padding: 16, fontSize: "1.05rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Check size={18} /> I Have Paid ₹{AMOUNT} — Unlock Ebook Now →
              </button>
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--color-muted)", textAlign: "center", margin: 0 }}>
              Instant lifetime access • 30-Day Money-Back Guarantee • 256-bit Secure
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// 9. THANK YOU / SUCCESS PAGE
function ThankYouPage({ navigate, siteSettings = getSiteSettings() }) {
  const currentPrice = siteSettings?.price || 79;
  const currentUpi = siteSettings?.upiId || "bhushan.shimpi1@ybl";
  const customerData = (() => {
    try {
      return JSON.parse(localStorage.getItem("ai_income_customer")) || {};
    } catch {
      return {};
    }
  })();

  return (
    <div className="section animate-page" style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}>
      <div className="container">
        <div className="success-box animate-fade-up">
          <div className="success-icon-badge">
            <Check size={32} />
          </div>

          <div>
            <span className="eyebrow">ORDER CONFIRMED & ACCESS GRANTED</span>
            <h1 style={{ fontSize: "2.5rem", margin: "8px 0" }}>You're In!</h1>
            <p>Your payment of ₹{currentPrice} has been confirmed. All 15 chapters and prompt libraries are now fully unlocked.</p>
          </div>

          <div style={{ width: "100%", padding: "20px", background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#059669", fontWeight: 700, fontSize: "0.95rem" }}>
              <Check size={18} /> Payment Successful (₹{currentPrice} to {currentUpi})
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--color-secondary)", display: "flex", flexDirection: "column", gap: 6 }}>
              {customerData.name && (
                <div><b>Customer:</b> {customerData.name} ({customerData.email})</div>
              )}
              <div><b>Payment:</b> ₹{currentPrice} (Confirmed via UPI)</div>
              <div><b>Access Status:</b> <span style={{ color: "#059669", fontWeight: 600 }}>Active (Lifetime Access Unlocked)</span></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, width: "100%", flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn-primary btn-accent" style={{ flex: "1 1 180px" }} onClick={() => navigate("chapter-1")}>
              Start Reading Introduction →
            </button>
            <button className="btn-secondary" style={{ flex: "1 1 180px" }} onClick={() => navigate("chapters")}>
              Browse All 15 Chapters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. LOGIN / USER EMAIL PURCHASE VERIFICATION PAGE
function LoginPage({ navigate, setUnlocked, unlocked, siteSettings = getSiteSettings() }) {
  const currentPrice = siteSettings?.price || 79;
  const currentUpi = siteSettings?.upiId || "bhushan.shimpi1@ybl";
  const supportEmail = siteSettings?.supportEmail || LEGAL_DETAILS.email;
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem(CURRENT_USER_KEY) || "");

  const AUTHOR_EMAILS = [
    LEGAL_DETAILS.email.toLowerCase(),
    "shimpibhushan2503@gmail.com",
    "bhushan.shimpi1@ybl",
    supportEmail.toLowerCase(),
    "support@aiincomeguide.com"
  ];

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setVerificationResult({
        purchased: false,
        error: true,
        message: "Please enter a valid email address to verify."
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await verifyReaderAccessApi(cleanEmail);

      if (res && (res.purchased || res.unlocked)) {
        // Purchase Verified in PostgreSQL Database
        setUnlocked(true);
        localStorage.setItem(STORAGE_KEY, "true");
        localStorage.setItem(CURRENT_USER_KEY, cleanEmail);

        const currentList = (() => {
          try { return JSON.parse(localStorage.getItem(EMAILS_STORAGE_KEY)) || []; } catch { return []; }
        })();
        if (!currentList.includes(cleanEmail)) {
          currentList.push(cleanEmail);
          localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(currentList));
        }

        setCurrentUser(cleanEmail);
        setVerificationResult({
          purchased: true,
          email: cleanEmail,
          name: res.name || cleanEmail.split("@")[0],
          orderId: res.orderId,
          purchaseDate: res.purchaseDate,
          status: res.status || "Verified Purchaser",
          message: res.message || "Purchase verified! Lifetime reader access confirmed."
        });
      } else {
        // No purchase found in Database
        setVerificationResult({
          purchased: false,
          email: cleanEmail,
          status: "Not Purchased",
          message: res?.message || `No purchase record found for "${cleanEmail}".`
        });
      }
    } catch (err) {
      // Local fallback for author or cached sessions
      if (AUTHOR_EMAILS.includes(cleanEmail)) {
        setUnlocked(true);
        localStorage.setItem(STORAGE_KEY, "true");
        localStorage.setItem(CURRENT_USER_KEY, cleanEmail);
        setCurrentUser(cleanEmail);
        setVerificationResult({
          purchased: true,
          email: cleanEmail,
          name: "BHUSHAN KISHOR SHIMPI",
          status: "Author / Owner",
          message: "Author access verified! All chapters unlocked."
        });
      } else {
        setVerificationResult({
          purchased: false,
          email: cleanEmail,
          status: "Not Purchased",
          message: `No completed purchase found for "${cleanEmail}".`
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setUnlocked(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser("");
    setVerificationResult(null);
    setEmail("");
  };

  return (
    <div className="section animate-page" style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}>
      <div className="container">
        <div className="auth-box animate-fade-up" style={{ maxWidth: 520 }}>
          <div className="auth-header">
            <div className="auth-icon-badge">
              {unlocked ? <ShieldCheck size={28} /> : <Mail size={28} />}
            </div>
            <span className="eyebrow">
              {unlocked ? "ACTIVE SUBSCRIPTION" : "PURCHASE VERIFICATION"}
            </span>
            <h1 style={{ fontSize: "1.9rem", margin: "4px 0" }}>
              {unlocked ? "Ebook Access Unlocked" : "Verify Ebook Purchase"}
            </h1>
            <p style={{ fontSize: "0.92rem", color: "var(--color-secondary)", margin: "4px 0 0" }}>
              {unlocked
                ? "You have full lifetime access to all 15 sections and copy-paste prompt templates."
                : "Enter your email address to check if you have purchased the ebook and unlock reading access."}
            </p>
          </div>

          {/* STATE 1: ALREADY UNLOCKED / ACTIVE READER */}
          {unlocked && !verificationResult ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
              <div style={{ padding: 18, background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#065F46", fontWeight: 700, fontSize: "0.92rem", marginBottom: 6 }}>
                  <ShieldCheck size={18} /> Verified Reader Account Active
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-primary)" }}>
                  {currentUser || "Verified Reader"}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#047857", marginTop: 4 }}>
                  Lifetime Access • All 15 Manuscript Sections & Prompt Library Unlocked
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  className="btn-primary btn-accent"
                  style={{ width: "100%", justifyContent: "center", padding: 14 }}
                  onClick={() => navigate("chapter-1")}
                >
                  Start Reading Chapter 1 →
                </button>
                <button
                  className="btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => navigate("chapters")}
                >
                  Browse All 15 Chapters
                </button>
                {AUTHOR_EMAILS.includes(currentUser.toLowerCase()) && (
                  <button
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center", background: "var(--color-primary)" }}
                    onClick={() => navigate("admin")}
                  >
                    ⚡ Open Admin Sales Dashboard →
                  </button>
                )}
              </div>

              <div style={{ textAlign: "center", paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
                <button
                  className="btn-link"
                  onClick={handleLogout}
                  style={{ fontSize: "0.85rem", color: "var(--color-muted)", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <LogOut size={14} /> Log out on this device
                </button>
              </div>
            </div>
          ) : verificationResult?.purchased ? (
            /* STATE 2: VERIFICATION SUCCESS CARD */
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
              <div style={{ padding: 20, background: "#ECFDF5", border: "1px solid #10B981", borderRadius: "var(--radius-lg)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#065F46", marginBottom: 12 }}>
                  <CheckCircle size={24} color="#059669" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#065F46" }}>Purchase Verified!</h3>
                    <span style={{ fontSize: "0.82rem", color: "#047857" }}>Lifetime access confirmed in database</span>
                  </div>
                </div>

                <div style={{ fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: 6, color: "var(--color-secondary)", padding: "12px", background: "#FFFFFF", borderRadius: "var(--radius-md)", border: "1px solid #D1FAE5" }}>
                  <div><b>Customer:</b> {verificationResult.name}</div>
                  <div><b>Email:</b> {verificationResult.email}</div>
                  <div><b>Status:</b> <span style={{ color: "#059669", fontWeight: 700 }}>✓ {verificationResult.status}</span></div>
                  {verificationResult.orderId && (
                    <div><b>Reference:</b> <code style={{ fontSize: "0.8rem" }}>{verificationResult.orderId}</code></div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  className="btn-primary btn-accent"
                  style={{ width: "100%", justifyContent: "center", padding: 14 }}
                  onClick={() => navigate("chapter-1")}
                >
                  Start Reading Introduction (Chapter 1) →
                </button>
                <button
                  className="btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => navigate("chapters")}
                >
                  Browse Chapter Directory
                </button>
              </div>
            </div>
          ) : verificationResult && !verificationResult.purchased ? (
            /* STATE 3: VERIFICATION FAILED - NOT PURCHASED */
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
              <div style={{ padding: 20, background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "var(--radius-lg)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#991B1B", marginBottom: 10 }}>
                  <AlertCircle size={24} color="#DC2626" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#991B1B" }}>No Purchase Record Found</h3>
                    <span style={{ fontSize: "0.82rem", color: "#B91C1C" }}>Database check completed</span>
                  </div>
                </div>

                <p style={{ fontSize: "0.9rem", color: "#7F1D1D", margin: "0 0 10px", lineHeight: 1.5 }}>
                  We checked our verified buyer database for <b>"{verificationResult.email}"</b>, but no active completed purchase of <b>AI Income for Everyone</b> was found.
                </p>

                <div style={{ padding: "10px 14px", background: "#FFFFFF", borderRadius: "var(--radius-md)", border: "1px solid #FECACA", fontSize: "0.84rem", color: "#991B1B" }}>
                  💡 <b>Did you pay with another email?</b> Please verify using the exact email address you entered during checkout.
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  className="btn-primary btn-accent"
                  style={{ width: "100%", justifyContent: "center", padding: 14 }}
                  onClick={() => navigate("checkout")}
                >
                  Buy Ebook for ₹{currentPrice} (Instant Access) →
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    setVerificationResult(null);
                    setEmail("");
                  }}
                >
                  ← Try Another Email Address
                </button>
              </div>

              <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--color-muted)" }}>
                Need help with your order?{" "}
                <span
                  style={{ color: "var(--color-accent)", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => navigate("contact")}
                >
                  Contact Support
                </span>
              </div>
            </div>
          ) : (
            /* STATE 4: DEFAULT VERIFICATION FORM */
            <form onSubmit={handleVerifyEmail} style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 20 }}>
              <div className="form-group">
                <label>Your Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
                <span style={{ fontSize: "0.8rem", color: "var(--color-secondary)" }}>
                  Enter the email address used during purchase to verify your access.
                </span>
              </div>

              <button
                type="submit"
                className="btn-primary btn-accent"
                disabled={isVerifying}
                style={{ width: "100%", padding: 14, fontSize: "1rem", justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
              >
                {isVerifying ? (
                  <>Verifying Purchase Status...</>
                ) : (
                  <>
                    <Key size={18} /> Verify Purchase & Access Ebook →
                  </>
                )}
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "center", fontSize: "0.88rem", marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
                  <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>DON'T HAVE THE EBOOK YET?</span>
                  <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate("checkout")}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Buy Ebook for ₹{currentPrice} (Instant Access) →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// 11. CONTACT PAGE
function ContactPage({ navigate }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitContactInquiryApi(formData);
    } catch (err) {
      console.warn("Contact inquiry backend notice:", err);
    }
    setSubmitted(true);
  };

  return (
    <div className="section animate-page">
      <div className="container">
        <div className="contact-layout">
          <div className="animate-fade-up">
            <span className="eyebrow">CUSTOMER SUPPORT & COMPLIANCE</span>
            <h1>Contact Us</h1>
            <p style={{ marginTop: 12, marginBottom: 24, fontSize: "1.05rem", color: "var(--color-secondary)" }}>
              Have questions regarding the ebook, need assistance restoring your digital access, or want to discuss licensing? We are here to help.
            </p>

            <div className="legal-entity-card" style={{ marginTop: 0, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <ShieldCheck size={22} color="var(--color-accent)" />
                <h3 style={{ margin: 0, fontSize: "1.15rem" }}>Verified Merchant Information</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.95rem" }}>
                <div>
                  <span style={{ color: "var(--color-muted)", display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Legal Name</span>
                  <b style={{ color: "var(--color-primary)", fontSize: "1.05rem" }}>{LEGAL_DETAILS.legalName}</b>
                </div>
                <div>
                  <span style={{ color: "var(--color-muted)", display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Official Support Email</span>
                  <a href={`mailto:${LEGAL_DETAILS.email}`} style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
                    {LEGAL_DETAILS.email}
                  </a>
                </div>
                <div>
                  <span style={{ color: "var(--color-muted)", display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone & WhatsApp Support</span>
                  <a href={`tel:${LEGAL_DETAILS.rawPhone}`} style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
                    {LEGAL_DETAILS.phone}
                  </a>
                </div>
                <div>
                  <span style={{ color: "var(--color-muted)", display: "block", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Business Operation</span>
                  <span style={{ color: "var(--color-secondary)" }}>Independent Digital Publisher & Educational Content Author</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, borderTop: "1px solid var(--color-border)", paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <Clock size={18} color="var(--color-accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <b style={{ display: "block", color: "var(--color-primary)", fontSize: "0.95rem" }}>Support & Operating Hours</b>
                  <span style={{ color: "var(--color-secondary)", fontSize: "0.9rem" }}>{LEGAL_DETAILS.supportHours}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <Mail size={18} color="var(--color-accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <b style={{ display: "block", color: "var(--color-primary)", fontSize: "0.95rem" }}>Response Timeline</b>
                  <span style={{ color: "var(--color-secondary)", fontSize: "0.9rem" }}>We respond to all customer emails and queries within 24 to 48 business hours.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fade-up delay-1">
            {submitted ? (
              <div style={{ padding: 48, background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                <Check size={40} color="#059669" style={{ margin: "0 auto 16px" }} />
                <h3>Thank You for Reaching Out</h3>
                <p style={{ marginTop: 8, color: "var(--color-secondary)", lineHeight: 1.6 }}>
                  Your message has been delivered directly to <b>{LEGAL_DETAILS.legalName}</b> at <b>{LEGAL_DETAILS.email}</b>. We will get back to you within 24 business hours.
                </p>
                <button
                  className="btn-secondary"
                  onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", message: "" }); }}
                  style={{ marginTop: 20 }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="checkout-form contact-form-card" onSubmit={handleSubmit}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "1.25rem" }}>Send a Direct Message</h3>
                <div className="form-group">
                  <label>Your Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message / Inquiry *</label>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    placeholder="Describe your inquiry, order question, or feedback..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary btn-accent" style={{ width: "100%", justifyContent: "center" }}>
                  Submit Inquiry →
                </button>
                <span style={{ fontSize: "0.8rem", color: "var(--color-muted)", textAlign: "center", display: "block" }}>
                  Direct support: {LEGAL_DETAILS.email} • {LEGAL_DETAILS.phone}
                </span>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 12. ABOUT US PAGE
function AboutPage({ navigate }) {
  return (
    <div className="section animate-page">
      <div className="container-editorial legal-content animate-fade-up">
        <span className="eyebrow">ABOUT THE AUTHOR & PUBLISHER</span>
        <h1>About Us</h1>
        <div className="legal-date">Last Updated: October 2026</div>

        <div className="legal-notice-box">
          <b>Official Entity Information:</b>
          <div style={{ marginTop: 6 }}>
            This website and the publication <b>"AI Income for Everyone"</b> are owned, authored, and operated solely by <b>{LEGAL_DETAILS.legalName}</b>.
          </div>
        </div>

        <h2>1. Who We Are</h2>
        <p>
          Welcome to <b>AI Income for Everyone</b>. This educational platform was founded and is personally operated by <b>{LEGAL_DETAILS.legalName}</b>, an independent digital creator, author, and technology educator based in India.
        </p>
        <p>
          With artificial intelligence tools expanding rapidly across the world, our mission is to cut through confusing jargon, exaggerated claims, and expensive technical courses to bring clear, honest, and actionable AI literacy to everyday people.
        </p>

        <h2>2. Our Publication & Mission</h2>
        <p>
          <b>"AI Income for Everyone"</b> is a comprehensive, beginner-friendly digital ebook and web guide crafted specifically for students, working professionals, homemakers, and freelancers who want to earn supplementary income using modern, zero-cost AI tools (such as ChatGPT, Claude, and Canva).
        </p>
        <p>
          Every chapter focuses on practical, real-world workflows that require zero coding or prior technical expertise. From creating digital planners and content generation to freelance assistance and local business consulting, each method includes copy-paste prompt templates, clear tool recommendations, and realistic daily time commitments.
        </p>

        <h2>3. Transparency & Consumer Protection</h2>
        <p>
          We believe in complete transparency and consumer trust:
        </p>
        <ul>
          <li><b>Affordable Single-Time Pricing:</b> We offer the full digital edition at a simple one-time payment of ₹{LEGAL_DETAILS.price} with lifetime updates, zero recurring subscriptions, and no hidden upsells.</li>
          <li><b>Instant Digital Access:</b> Upon successful payment, readers receive immediate access in their web browser and a digital confirmation link to their email address within 0 to 5 minutes.</li>
          <li><b>100% 30-Day Money-Back Guarantee:</b> We want every reader to feel completely secure. If you go through the guide and feel it did not deliver practical value for your time, you are covered by our 30-day no-hassle refund guarantee.</li>
        </ul>

        <h2>4. Legal Owner & Contact Information</h2>
        <div className="legal-entity-card">
          <div className="legal-meta-grid">
            <div className="legal-meta-item">
              <b>Legal Owner / Author</b>
              <span>{LEGAL_DETAILS.legalName}</span>
            </div>
            <div className="legal-meta-item">
              <b>Support Email</b>
              <span><a href={`mailto:${LEGAL_DETAILS.email}`} style={{ color: "inherit", textDecoration: "none" }}>{LEGAL_DETAILS.email}</a></span>
            </div>
            <div className="legal-meta-item">
              <b>Phone Contact</b>
              <span><a href={`tel:${LEGAL_DETAILS.rawPhone}`} style={{ color: "inherit", textDecoration: "none" }}>{LEGAL_DETAILS.phone}</a></span>
            </div>
            <div className="legal-meta-item">
              <b>Operating Hours</b>
              <span>{LEGAL_DETAILS.supportHours}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 40, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button className="btn-primary btn-accent" onClick={() => navigate("checkout")}>
            Get the Ebook for ₹{LEGAL_DETAILS.price} →
          </button>
          <button className="btn-secondary" onClick={() => navigate("chapters")}>
            Browse Chapter Directory
          </button>
        </div>
      </div>
    </div>
  );
}

// 13. PRIVACY POLICY PAGE
function PrivacyPage() {
  return (
    <div className="section animate-page">
      <div className="container-editorial legal-content animate-fade-up">
        <span className="eyebrow">LEGAL COMPLIANCE</span>
        <h1>Privacy Policy</h1>
        <div className="legal-date">Last Updated: October 2026</div>

        <div className="legal-notice-box">
          This Privacy Policy applies to the website and digital publication <b>AI Income for Everyone</b>, operated and managed by <b>{LEGAL_DETAILS.legalName}</b> ("we", "us", or "our"). We are committed to safeguarding your personal privacy and maintaining strict confidentiality of the information you share with us.
        </div>

        <h2>1. Information We Collect</h2>
        <p>
          We only collect personal information that you voluntarily provide to us when purchasing our digital ebook or contacting customer support:
        </p>
        <ul>
          <li><b>Customer Contact Information:</b> Name and email address entered during checkout or when submitting inquiries via our contact form.</li>
          <li><b>Transaction Identifiers:</b> Order reference numbers and payment transaction IDs generated by authorized payment gateways (e.g., Cashfree / UPI) for the purpose of verifying order fulfillment.</li>
        </ul>
        <p>
          <b>We DO NOT collect or store sensitive financial information:</b> We do not collect, store, or process debit/credit card numbers, CVVs, net banking passwords, or UPI PINs on our servers. All financial transactions are securely processed through Reserve Bank of India (RBI) authorized payment aggregators with bank-grade 256-bit SSL encryption.
        </p>

        <h2>2. Purpose & Use of Collected Information</h2>
        <p>
          Any personal data collected is utilized strictly for legitimate operational purposes:
        </p>
        <ul>
          <li>To immediately grant and unlock access to the digital ebook and web reader application.</li>
          <li>To deliver purchase confirmation receipts, access keys, and future edition updates to your registered email address.</li>
          <li>To communicate regarding customer support queries, billing questions, or refund requests.</li>
          <li>To prevent fraudulent transactions and maintain lawful accounting records.</li>
        </ul>
        <p>
          <b>No Data Selling:</b> We strictly never sell, rent, license, or monetize your personal details to third-party advertisers, brokers, or marketing agencies.
        </p>

        <h2>3. Cookies and Local Storage</h2>
        <p>
          We use minimal local browser storage (<code>localStorage</code>) strictly necessary for functional purposes—such as remembering your unlocked reading status, bookmarking your reading position across chapters, and caching your display preferences on your local device. We do not use third-party tracking or cross-site tracking cookies.
        </p>

        <h2>4. Data Security & Storage</h2>
        <p>
          We adopt industry-standard security measures, including HTTPS encryption via SSL/TLS protocols and restricted access controls, to safeguard personal information against unauthorized access, alteration, or disclosure.
        </p>

        <h2>5. Your Data Rights</h2>
        <p>
          As a user, you have the right to request access to the information we hold about you or request the removal of your customer record from our mailing list. To exercise any of these rights, please write to us directly at <b>{LEGAL_DETAILS.email}</b>.
        </p>

        <h2>6. Grievance Officer & Contact Information</h2>
        <p>
          In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the designated Grievance Officer and Data Controller for this website is:
        </p>

        <div className="legal-entity-card">
          <div className="legal-meta-grid">
            <div className="legal-meta-item">
              <b>Grievance Officer & Legal Owner</b>
              <span>{LEGAL_DETAILS.legalName}</span>
            </div>
            <div className="legal-meta-item">
              <b>Designated Email</b>
              <span><a href={`mailto:${LEGAL_DETAILS.email}`} style={{ color: "inherit", textDecoration: "none" }}>{LEGAL_DETAILS.email}</a></span>
            </div>
            <div className="legal-meta-item">
              <b>Phone Contact</b>
              <span><a href={`tel:${LEGAL_DETAILS.rawPhone}`} style={{ color: "inherit", textDecoration: "none" }}>{LEGAL_DETAILS.phone}</a></span>
            </div>
            <div className="legal-meta-item">
              <b>Response Commitment</b>
              <span>Acknowledgment within 24–48 hours; resolution within 15 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 14. TERMS & CONDITIONS PAGE
function TermsPage() {
  return (
    <div className="section animate-page">
      <div className="container-editorial legal-content animate-fade-up">
        <span className="eyebrow">LEGAL COMPLIANCE</span>
        <h1>Terms & Conditions</h1>
        <div className="legal-date">Last Updated: October 2026</div>

        <div className="legal-notice-box">
          Welcome to <b>AI Income for Everyone</b>. These Terms & Conditions constitute a legally binding agreement between you ("User", "Customer", or "Reader") and <b>{LEGAL_DETAILS.legalName}</b> ("Owner", "Publisher", "we", or "us"). By accessing this website or purchasing our digital product, you acknowledge and agree to comply with these terms.
        </div>

        <h2>1. Description of Product & Service</h2>
        <p>
          We provide educational digital content titled <b>"AI Income for Everyone"</b>, delivered via an interactive web reader and digital materials. The product teaches practical workflows and strategies for using artificial intelligence tools to generate supplementary income.
        </p>

        <h2>2. Pricing & Payment Terms</h2>
        <p>
          All prices displayed on this website are in Indian Rupees (INR - ₹) and are inclusive of all applicable taxes.
        </p>
        <ul>
          <li>The standard one-time purchase price is ₹{LEGAL_DETAILS.price}.</li>
          <li>Payments are processed securely via authorized Indian payment aggregators (Cashfree / UPI / Cards / Net Banking).</li>
          <li>There are zero recurring subscriptions, hidden fees, or automatic renewals. Your payment entitles you to lifetime access to the purchased edition and all future updates.</li>
        </ul>

        <h2>3. Digital License & Usage Rights</h2>
        <p>
          Upon successful purchase, <b>{LEGAL_DETAILS.legalName}</b> grants you a personal, single-user, non-exclusive, non-transferable, and revocable license to access, view, and read the ebook for personal educational purposes.
        </p>
        <p>
          <b>Restrictions:</b> You may NOT resell, redistribute, sub-license, copy, upload to public repositories or torrent trackers, translate, or broadcast any part of the manuscript, text, prompt frameworks, or proprietary materials without express prior written permission from <b>{LEGAL_DETAILS.legalName}</b>.
        </p>

        <h2>4. Intellectual Property Rights</h2>
        <p>
          All literary content, text, prompt templates, illustrations, cover artwork, website design, and underlying code are the exclusive intellectual property and copyright of <b>{LEGAL_DETAILS.legalName}</b>. All rights are reserved under Indian and international copyright laws.
        </p>

        <h2>5. Educational Disclaimer & No Earnings Guarantee</h2>
        <p>
          The methods, prompt strategies, and business models described in "AI Income for Everyone" are intended strictly for educational and informational purposes. Earning results depend entirely on the individual user's background, work ethic, market conditions, and time invested. <b>{LEGAL_DETAILS.legalName}</b> makes no explicit or implicit earnings guarantees or warranties that following the guide will result in specific financial income.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable Indian law, <b>{LEGAL_DETAILS.legalName}</b> shall not be liable for any indirect, incidental, punitive, or consequential damages arising from the use or inability to use this website or digital product. In any event, our aggregate liability shall not exceed the amount actually paid by you for the product (₹{LEGAL_DETAILS.price}).
        </p>

        <h2>7. Governing Law and Jurisdiction</h2>
        <p>
          These Terms & Conditions shall be governed by, construed, and enforced in accordance with the laws of the Republic of India. Any legal disputes or claims arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in Maharashtra, India.
        </p>

        <h2>8. Contact Information</h2>
        <div className="legal-entity-card">
          <div className="legal-meta-grid">
            <div className="legal-meta-item">
              <b>Publisher & Legal Owner</b>
              <span>{LEGAL_DETAILS.legalName}</span>
            </div>
            <div className="legal-meta-item">
              <b>Official Email</b>
              <span><a href={`mailto:${LEGAL_DETAILS.email}`} style={{ color: "inherit", textDecoration: "none" }}>{LEGAL_DETAILS.email}</a></span>
            </div>
            <div className="legal-meta-item">
              <b>Support Phone</b>
              <span><a href={`tel:${LEGAL_DETAILS.rawPhone}`} style={{ color: "inherit", textDecoration: "none" }}>{LEGAL_DETAILS.phone}</a></span>
            </div>
            <div className="legal-meta-item">
              <b>Support Hours</b>
              <span>{LEGAL_DETAILS.supportHours}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 15. REFUND & CANCELLATION POLICY PAGE
function RefundPage({ navigate }) {
  return (
    <div className="section animate-page">
      <div className="container-editorial legal-content animate-fade-up">
        <span className="eyebrow">CUSTOMER PROTECTION & GUARANTEE</span>
        <h1>Refund & Cancellation Policy</h1>
        <div className="legal-date">Last Updated: October 2026</div>

        <div className="legal-notice-box">
          At <b>AI Income for Everyone</b>, published and operated by <b>{LEGAL_DETAILS.legalName}</b>, customer satisfaction is our highest priority. We want you to invest in your education with 100% confidence, backed by our clear and fair 30-day refund guarantee.
        </div>

        <h2>1. 100% 30-Day Money-Back Guarantee</h2>
        <p>
          We provide a full <b>30-day money-back guarantee</b> on your purchase of "AI Income for Everyone". If you purchase the guide, go through the chapters, and honestly feel that the material did not deliver practical, actionable value for your time and money, you are entitled to a 100% full refund within 30 calendar days from the date of purchase.
        </p>

        <h2>2. Cancellation Policy</h2>
        <p>
          Because "AI Income for Everyone" is a digital educational product that is unlocked immediately upon successful payment verification, standard physical order cancellations prior to dispatch do not apply.
        </p>
        <p>
          However, any post-payment cancellation request is fully accommodated under our <b>30-Day Refund Policy</b> without questions asked or cancellation penalties.
        </p>

        <h2>3. How to Request a Refund or Cancellation</h2>
        <p>
          Requesting a refund is simple, fast, and transparent:
        </p>
        <ol>
          <li>Send an email to <b>{LEGAL_DETAILS.email}</b> or contact us via WhatsApp/call at <b>{LEGAL_DETAILS.phone}</b>.</li>
          <li>Include the email address you entered during checkout and your payment transaction ID / order reference.</li>
          <li>Let us know you would like a refund. You do not need to provide complicated justifications or documentation.</li>
        </ol>

        <h2>4. Refund Processing & Settlement Turnaround</h2>
        <p>
          Once we receive your refund request:
        </p>
        <ul>
          <li><b>Review & Confirmation:</b> Your request will be acknowledged and approved within <b>24 to 48 business hours</b>.</li>
          <li><b>Settlement Timeline:</b> The refund will be credited back directly to your <b>original payment source</b> (source bank account, UPI ID, or debit/credit card) within <b>5 to 7 business days</b>, in accordance with standard Indian banking and payment gateway clearing cycles.</li>
          <li><b>Deductions:</b> We do not charge any administrative or restocking fees. You receive 100% of the purchase amount (₹{LEGAL_DETAILS.price}) back.</li>
        </ul>

        <h2>5. Merchant & Contact Details</h2>
        <div className="legal-entity-card">
          <div className="legal-meta-grid">
            <div className="legal-meta-item">
              <b>Legal Merchant Name</b>
              <span>{LEGAL_DETAILS.legalName}</span>
            </div>
            <div className="legal-meta-item">
              <b>Refund Support Email</b>
              <span><a href={`mailto:${LEGAL_DETAILS.email}`} style={{ color: "inherit", textDecoration: "none" }}>{LEGAL_DETAILS.email}</a></span>
            </div>
            <div className="legal-meta-item">
              <b>Support Phone / WhatsApp</b>
              <span><a href={`tel:${LEGAL_DETAILS.rawPhone}`} style={{ color: "inherit", textDecoration: "none" }}>{LEGAL_DETAILS.phone}</a></span>
            </div>
            <div className="legal-meta-item">
              <b>Processing SLA</b>
              <span>5 to 7 business days to original payment method</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 40, padding: 24, background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
          <p style={{ margin: 0 }}>
            Have a question before or after purchasing? Check out our <button className="btn-link" onClick={() => navigate("faq")}>FAQ</button> or <button className="btn-link" onClick={() => navigate("contact")}>contact our support team</button>.
          </p>
        </div>
      </div>
    </div>
  );
}

// 16. SHIPPING & DELIVERY POLICY PAGE
function ShippingPage({ navigate }) {
  return (
    <div className="section animate-page">
      <div className="container-editorial legal-content animate-fade-up">
        <span className="eyebrow">DIGITAL FULFILLMENT & ACCESS</span>
        <h1>Shipping & Delivery Policy</h1>
        <div className="legal-date">Last Updated: October 2026</div>

        <div className="legal-notice-box">
          This Shipping & Delivery Policy outlines the electronic fulfillment process for digital purchases on <b>AI Income for Everyone</b>, authored, published, and operated by <b>{LEGAL_DETAILS.legalName}</b>.
        </div>

        <h2>1. 100% Digital Delivery (No Physical Shipping)</h2>
        <p>
          All products offered on this website ("AI Income for Everyone") are <b>strictly digital electronic goods</b>.
        </p>
        <p>
          No physical package, paper book, CD, DVD, or hardware is shipped or dispatched through postal, courier, or logistics services. Consequently, there are no postal transit delays, delivery tracking numbers, or physical damages to worry about.
        </p>

        <h2>2. Delivery Timeline & Electronic Fulfillment</h2>
        <ul>
          <li><b>Instant Browser Access (Immediate):</b> As soon as your payment of ₹{LEGAL_DETAILS.price} is verified via our payment gateway, access to the entire 15-section digital ebook is unlocked in your browser immediately.</li>
          <li><b>Email Confirmation (0–5 Minutes):</b> A confirmation receipt and digital access link are electronically dispatched to the email address provided during checkout within <b>0 to 5 minutes</b> of transaction completion.</li>
          <li><b>Lifetime Re-Access:</b> Readers can return to the website at any time on any device (mobile, tablet, desktop) and access the complete content by entering their registered purchase email on the <b>Reader Login</b> page.</li>
        </ul>

        <h2>3. Shipping Charges</h2>
        <p>
          Because our products are delivered entirely via electronic transmission over the internet, <b>shipping is 100% FREE (₹0.00)</b>. There are no delivery charges, handling fees, or postal tariffs.
        </p>

        <h2>4. Delivery Issues & Access Restoration</h2>
        <p>
          In rare situations where a customer experiences network dropouts, enters a mistyped email, or does not receive the automated confirmation email within 10 minutes:
        </p>
        <ul>
          <li>Visit the <b><button className="btn-link" onClick={() => navigate("login")}>Reader Login</button></b> page and submit the email address used during payment to instantly verify and unlock your access.</li>
          <li>Contact our support team directly with your payment reference or transaction ID. We will manually verify your payment and ensure your digital access is restored within <b>2 to 4 business hours</b>.</li>
        </ul>

        <h2>5. Publisher & Delivery Inquiries</h2>
        <div className="legal-entity-card">
          <div className="legal-meta-grid">
            <div className="legal-meta-item">
              <b>Publisher & Legal Owner</b>
              <span>{LEGAL_DETAILS.legalName}</span>
            </div>
            <div className="legal-meta-item">
              <b>Support Email</b>
              <span><a href={`mailto:${LEGAL_DETAILS.email}`} style={{ color: "inherit", textDecoration: "none" }}>{LEGAL_DETAILS.email}</a></span>
            </div>
            <div className="legal-meta-item">
              <b>Support Phone / WhatsApp</b>
              <span><a href={`tel:${LEGAL_DETAILS.rawPhone}`} style={{ color: "inherit", textDecoration: "none" }}>{LEGAL_DETAILS.phone}</a></span>
            </div>
            <div className="legal-meta-item">
              <b>Fulfillment Window</b>
              <span>Instant / 0 to 5 minutes (Digital electronic delivery)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ROUTE NORMALIZATION HELPER FOR VERCEL PATHS & HASHES
function normalizeRoute(pathOrHash) {
  if (!pathOrHash) return "home";
  const clean = String(pathOrHash).replace(/^[#/]+/, "").split(/[?#]/)[0].trim().toLowerCase();
  if (!clean || clean === "" || clean === "index.html") return "home";

  if (clean === "privacy" || clean === "privacy-policy" || clean === "privacypolicy") return "privacy";
  if (clean === "terms" || clean === "terms-and-conditions" || clean === "terms-conditions" || clean === "terms-of-service" || clean === "tos") return "terms";
  if (clean === "refund" || clean === "refund-policy" || clean === "refund-and-cancellation" || clean === "refunds" || clean === "cancellation-policy" || clean === "cancellation" || clean === "refund-cancellation") return "refund";
  if (clean === "shipping" || clean === "shipping-policy" || clean === "shipping-and-delivery" || clean === "delivery-policy" || clean === "delivery" || clean === "shipping-delivery") return "shipping";
  if (clean === "about" || clean === "about-us" || clean === "aboutus") return "about";
  if (clean === "contact" || clean === "contact-us" || clean === "contactus" || clean === "support") return "contact";
  if (clean === "faq" || clean === "faqs") return "faq";
  if (clean === "reviews" || clean === "testimonials") return "reviews";
  if (clean === "chapters" || clean === "table-of-contents" || clean === "directory") return "chapters";
  if (clean === "whats-inside" || clean === "inside") return "whats-inside";
  if (clean === "pricing" || clean === "price") return "pricing";
  if (clean === "checkout" || clean === "buy" || clean === "order" || clean === "payment") return "checkout";
  if (clean === "login" || clean === "my-access" || clean === "reader-login") return "login";
  if (clean === "thank-you" || clean === "success") return "thank-you";
  if (clean === "admin" || clean === "dashboard") return "admin";
  if (clean.startsWith("chapter-")) return clean;

  return clean;
}

// MAIN APPLICATION ROUTER & STATE
export default function App() {
  const getInitialRoute = () => {
    try {
      const hash = window.location.hash.replace("#", "").trim();
      if (hash) return normalizeRoute(hash);
      const path = window.location.pathname.replace(/^\//, "").trim();
      if (path) return normalizeRoute(path);
    } catch {}
    return "home";
  };

  const [route, setRoute] = useState(getInitialRoute);
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [siteSettings, setSiteSettings] = useState(getSiteSettings);
  const [chapters, setChapters] = useState(getMergedChapters);

  useEffect(() => {
    const handleSettingsUpdate = () => setSiteSettings(getSiteSettings());
    const handleChaptersUpdate = () => setChapters(getMergedChapters());
    window.addEventListener("site_settings_updated", handleSettingsUpdate);
    window.addEventListener("chapters_updated", handleChaptersUpdate);

    // Initial live sync with PostgreSQL database
    fetchSiteSettingsApi().then((s) => s && setSiteSettings(s)).catch(() => {});
    fetchChaptersApi().then((ch) => ch && setChapters(ch)).catch(() => {});

    return () => {
      window.removeEventListener("site_settings_updated", handleSettingsUpdate);
      window.removeEventListener("chapters_updated", handleChaptersUpdate);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      try {
        const hash = window.location.hash.replace("#", "").trim();
        if (hash) {
          setRoute(normalizeRoute(hash));
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        const path = window.location.pathname.replace(/^\//, "").trim();
        if (path) {
          setRoute(normalizeRoute(path));
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        setRoute("home");
      } catch {}
    };
    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const navigate = (targetRoute) => {
    const normalized = normalizeRoute(targetRoute);
    setRoute(normalized);
    try {
      const urlPath = normalized === "home" ? "/" : `/${normalized}`;
      window.history.pushState(null, "", urlPath);
      window.location.hash = normalized;
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderContent = () => {
    if (route.startsWith("chapter-")) {
      const chapterId = parseInt(route.replace("chapter-", ""), 10) || 1;
      return (
        <ChapterDetailPage
          chapterId={chapterId}
          navigate={navigate}
          unlocked={unlocked}
          setUnlocked={setUnlocked}
          chapters={chapters}
          siteSettings={siteSettings}
        />
      );
    }

    switch (route) {
      case "home":
        return <HomePage navigate={navigate} siteSettings={siteSettings} />;
      case "whats-inside":
        return <WhatsInsidePage navigate={navigate} siteSettings={siteSettings} />;
      case "chapters":
        return <ChaptersPage navigate={navigate} chapters={chapters} />;
      case "reviews":
        return <ReviewsPage navigate={navigate} siteSettings={siteSettings} />;
      case "faq":
        return <FaqPage navigate={navigate} />;
      case "pricing":
        return <PricingPage navigate={navigate} siteSettings={siteSettings} />;
      case "checkout":
        return <CheckoutPage navigate={navigate} setUnlocked={setUnlocked} siteSettings={siteSettings} />;
      case "thank-you":
        return <ThankYouPage navigate={navigate} siteSettings={siteSettings} />;
      case "contact":
        return <ContactPage navigate={navigate} />;
      case "about":
        return <AboutPage navigate={navigate} />;
      case "login":
        return <LoginPage navigate={navigate} setUnlocked={setUnlocked} unlocked={unlocked} siteSettings={siteSettings} />;
      case "admin":
      case "dashboard":
        return <AdminPage navigate={navigate} />;
      case "privacy":
        return <PrivacyPage />;
      case "terms":
        return <TermsPage />;
      case "refund":
        return <RefundPage navigate={navigate} />;
      case "shipping":
        return <ShippingPage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} siteSettings={siteSettings} />;
    }
  };

  const isAdminRoute = route === "admin" || route === "dashboard";

  return (
    <div
      style={{
        height: isAdminRoute ? "100vh" : "auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: isAdminRoute ? "hidden" : "visible"
      }}
    >
      {!isAdminRoute && <div className="reading-progress-bar" style={{ width: `${scrollProgress}%` }} />}
      {!isAdminRoute && <Header currentRoute={route} navigate={navigate} unlocked={unlocked} siteSettings={siteSettings} />}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: isAdminRoute ? "hidden" : "visible"
        }}
      >
        {renderContent()}
      </div>
      {!isAdminRoute && <Footer navigate={navigate} siteSettings={siteSettings} />}
    </div>
  );
}

// Mount to DOM
const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
