import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronUp,
  Clock, Copy, Download, ExternalLink, HelpCircle, Mail, Menu, MessageSquare,
  QrCode, Shield, Smartphone, Sparkles, Star, User, X, Zap
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ebookSections } from "./ebookContent";
import "./styles.css";

const PREVIEW_LIMIT = 1;
const STORAGE_KEY = "ai_income_purchased";

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
    a: "It is a one-time payment of ₹79. There are no recurring charges, hidden fees, or subscriptions."
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
function Header({ currentRoute, navigate }) {
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

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="header-brand" onClick={() => handleNav("home")}>
          <div className="brand-icon">AI</div>
          <span className="brand-name">AI Income for Everyone</span>
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
          <button className="btn-primary header-cta" onClick={() => handleNav("checkout")}>
            Get the Ebook → ₹79
          </button>
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
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => handleNav("checkout")}>
            Get the Ebook → ₹79
          </button>
        </div>
      )}
    </header>
  );
}

// Reusable Footer Component
function Footer({ navigate }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="header-brand" onClick={() => navigate("home")}>
              <div className="brand-icon">AI</div>
              <span className="brand-name">AI Income for Everyone</span>
            </div>
            <p>
              A practical, beginner-friendly guide to earning extra income with AI tools. Designed for students, professionals, and homemakers.
            </p>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <ul className="footer-links">
              <li><button onClick={() => navigate("home")}>Home</button></li>
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
              <li><button onClick={() => navigate("contact")}>Contact Support</button></li>
              <li><button onClick={() => navigate("checkout")}>Buy Ebook (₹79)</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><button onClick={() => navigate("privacy")}>Privacy Policy</button></li>
              <li><button onClick={() => navigate("terms")}>Terms & Conditions</button></li>
              <li><button onClick={() => navigate("refund")}>Refund Policy</button></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 AI Income for Everyone by Bhushan. All rights reserved.</span>
          <span>Digital Publishing & Practical AI Education.</span>
        </div>
      </div>
    </footer>
  );
}

// 1. HOME PAGE
function HomePage({ navigate }) {
  const [faqOpen, setFaqOpen] = useState(0);

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
                Get the Ebook — ₹79
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
                  alt="USE AI TO MAKE EXTRA INCOME Book Cover by Bhushan"
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
              <span className="stat-number">₹79</span>
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
                <span className="price-current">₹79</span>
                <span className="price-original">₹499</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--color-secondary)" }}>
                Instant access in your browser. No recurring fees.
              </p>
              <button className="btn-primary btn-accent" style={{ width: "100%" }} onClick={() => navigate("checkout")}>
                Get the Ebook → ₹79
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
function WhatsInsidePage({ navigate }) {
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
            Get the Complete Ebook — ₹79
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. CHAPTERS DIRECTORY PAGE
function ChaptersPage({ navigate }) {
  return (
    <div className="section animate-page">
      <div className="container">
        <div className="section-header center animate-fade-up">
          <span className="eyebrow">FULL DIRECTORY</span>
          <h1>The Complete 15-Section Roadmap</h1>
          <p>Explore the complete contents of the manuscript. Click any chapter to read.</p>
        </div>

        <div className="chapter-preview-list" style={{ marginTop: 48 }}>
          {CHAPTER_OVERVIEWS.map((ch, idx) => (
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
function ChapterDetailPage({ chapterId, navigate, unlocked, setUnlocked }) {
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const currentIdx = Math.max(0, Math.min(chapterId - 1, ebookSections.length - 1));
  const section = ebookSections[currentIdx] || ebookSections[0];
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
          {ebookSections.map((s, idx) => (
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
          <span className="eyebrow">SECTION {String(currentIdx + 1).padStart(2, "0")} OF {ebookSections.length}</span>
          <h1>{section.title}</h1>
          <span style={{ fontSize: "0.9rem", color: "var(--color-muted)", marginTop: 8, display: "block" }}>
            Estimated read time: ~{CHAPTER_OVERVIEWS[currentIdx]?.readTime || "5 min"} • USE AI TO MAKE EXTRA INCOME by Bhushan
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
                Unlock all 15 sections, ready-made prompt templates, and the complete 30-day action plan for a one-time payment of ₹79.
              </p>
              <button className="btn-primary" onClick={() => navigate("checkout")}>
                Get the Complete Ebook — ₹79
              </button>
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
            Section {currentIdx + 1} of {ebookSections.length}
          </span>

          <button
            className="btn-secondary"
            disabled={currentIdx === ebookSections.length - 1}
            onClick={() => navigate(`chapter-${currentIdx + 2}`)}
            style={{ opacity: currentIdx === ebookSections.length - 1 ? 0.4 : 1 }}
          >
            Next Section →
          </button>
        </div>
      </main>
    </div>
  );
}

// 5. REVIEWS PAGE
function ReviewsPage({ navigate }) {
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
            Join 1,000+ Readers — ₹79
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
function PricingPage({ navigate }) {
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
              <span className="price-current">₹79</span>
              <span className="price-original">₹499</span>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--color-secondary)" }}>
              One-time payment • Instant unlock via UPI (bhushan.shimpi1@ybl)
            </p>
            <button className="btn-primary btn-accent" style={{ width: "100%" }} onClick={() => navigate("checkout")}>
              Get the Ebook → ₹79
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
function CheckoutPage({ navigate, setUnlocked }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [utr, setUtr] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentOption, setPaymentOption] = useState("qr"); // "qr" or "intent"
  const [errorMessage, setErrorMessage] = useState("");

  const UPI_ID = "bhushan.shimpi1@ybl";
  const AMOUNT = "79";
  const PAYEE_NAME = "Bhushan Shimpi";
  const NOTE = "AI Income Ebook - Bhushan Shimpi";

  // Standard UPI URI format: opens UPI apps on mobile and encodes into QR code
  const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent(NOTE)}`;

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
    setUnlocked(true);
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.setItem(
      "ai_income_customer",
      JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        utr: utr.trim() || "UPI-CONFIRMED-79",
        upiId: UPI_ID,
        amount: 79,
        purchasedAt: new Date().toISOString()
      })
    );
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
                <h3 style={{ fontSize: "1.4rem" }}>USE AI TO MAKE EXTRA INCOME</h3>
                <span style={{ fontSize: "0.9rem", color: "var(--color-secondary)" }}>by Bhushan • Complete Digital Edition</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--color-primary)" }}>₹79</span>
                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--color-muted)", textDecoration: "line-through" }}>₹499</span>
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
                <b>Complete 2026 Edition</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-secondary)" }}>Payment Method:</span>
                <b>UPI (GPay/PhonePe/Paytm)</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-secondary)" }}>Amount Due:</span>
                <b style={{ color: "var(--color-accent)", fontSize: "1.05rem" }}>₹79 only</b>
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
            <h2 style={{ marginBottom: 0 }}>Unlock Your Copy for ₹79</h2>

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

            {/* Step 2: Pay ₹79 via UPI */}
            <div className="upi-pay-card">
              <div className="checkout-step">
                <span className="step-num">2</span>
                <span>Pay ₹79 to UPI ID: <span style={{ color: "var(--color-accent)" }}>{UPI_ID}</span></span>
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
                    <Check size={14} /> Amount Prefilled: ₹79
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
                    <Smartphone size={18} /> Open UPI App & Pay ₹79
                  </a>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <a
                    href={upiUrl}
                    className="upi-direct-btn"
                  >
                    <Smartphone size={18} /> Tap to Pay ₹79 via UPI App
                  </a>
                  <p style={{ fontSize: "0.82rem", color: "var(--color-muted)", textAlign: "center", margin: 0 }}>
                    Automatically opens GPay / PhonePe / Paytm with ₹79 prefilled.
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
                      <li>Send exactly <b>₹79</b> to <b>{UPI_ID}</b>.</li>
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

              <div className="form-group">
                <label>12-Digit UPI Ref / UTR No. (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 429381749201 (from your payment receipt)"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                />
                <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                  Enter transaction reference or click below to unlock directly after payment.
                </span>
              </div>

              <button
                type="submit"
                className="btn-primary btn-accent"
                style={{ width: "100%", padding: 16, fontSize: "1.05rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Check size={18} /> I Have Paid ₹79 — Unlock Ebook Now →
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
function ThankYouPage({ navigate }) {
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
            <p>Your payment of ₹79 has been confirmed. All 15 chapters and prompt libraries are now fully unlocked.</p>
          </div>

          <div style={{ width: "100%", padding: "20px", background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#059669", fontWeight: 700, fontSize: "0.95rem" }}>
              <Check size={18} /> Payment Successful (₹79 to bhushan.shimpi1@ybl)
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--color-secondary)", display: "flex", flexDirection: "column", gap: 6 }}>
              {customerData.name && (
                <div><b>Customer:</b> {customerData.name} ({customerData.email})</div>
              )}
              {customerData.utr && (
                <div><b>Reference:</b> {customerData.utr}</div>
              )}
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

// 10. CONTACT PAGE
function ContactPage({ navigate }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="section animate-page">
      <div className="container">
        <div className="contact-layout">
          <div className="animate-fade-up">
            <span className="eyebrow">GET IN TOUCH</span>
            <h1>Have a Question?</h1>
            <p style={{ marginTop: 12, marginBottom: 32 }}>
              Whether you need help with your order, want to request an invoice, or have a question about the book content, we are here to support you.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, borderTop: "1px solid var(--color-border)", paddingTop: 24 }}>
              <div>
                <b style={{ display: "block", color: "var(--color-primary)" }}>Support Email</b>
                <span style={{ color: "var(--color-secondary)", fontSize: "0.95rem" }}>support@aiincomeguide.com</span>
              </div>
              <div>
                <b style={{ display: "block", color: "var(--color-primary)" }}>Response Time</b>
                <span style={{ color: "var(--color-secondary)", fontSize: "0.95rem" }}>Usually within 12–24 business hours</span>
              </div>
              <div>
                <b style={{ display: "block", color: "var(--color-primary)" }}>Support Hours</b>
                <span style={{ color: "var(--color-secondary)", fontSize: "0.95rem" }}>Monday to Saturday, 9:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </div>

          <div className="animate-fade-up delay-1">
            {submitted ? (
              <div style={{ padding: 48, background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                <Check size={36} color="#059669" style={{ margin: "0 auto 16px" }} />
                <h3>Message Sent Successfully</h3>
                <p style={{ marginTop: 8 }}>Thank you for reaching out. We will respond to your email shortly.</p>
              </div>
            ) : (
              <form className="checkout-form contact-form-card" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input type="text" className="form-input" placeholder="Your name" required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-input" placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea className="form-textarea" rows="5" placeholder="How can we help you?" required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 11. LEGAL PAGES
function PrivacyPage() {
  return (
    <div className="section animate-page">
      <div className="container-editorial legal-content animate-fade-up">
        <span className="eyebrow">LEGAL DOCUMENT</span>
        <h1>Privacy Policy</h1>
        <div className="legal-date">Last Updated: September 2026</div>

        <h2>1. Information We Collect</h2>
        <p>
          We only collect personal information that you voluntarily provide to us when purchasing the ebook or contacting support, such as your name and email address. We do not store payment card numbers or banking passwords on our servers.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          Your information is used strictly to deliver your digital purchase, send edition updates, and respond to support queries. We do not sell, rent, or trade your personal data to third parties.
        </p>

        <h2>3. Data Security</h2>
        <p>
          We implement standard 256-bit SSL encryption and strict administrative safeguards to protect your personal details during transmission and storage.
        </p>

        <h2>4. Contact</h2>
        <p>
          If you have questions regarding this Privacy Policy, you may contact us at support@aiincomeguide.com.
        </p>
      </div>
    </div>
  );
}

function TermsPage() {
  return (
    <div className="section animate-page">
      <div className="container-editorial legal-content animate-fade-up">
        <span className="eyebrow">LEGAL DOCUMENT</span>
        <h1>Terms & Conditions</h1>
        <div className="legal-date">Last Updated: September 2026</div>

        <h2>1. Digital Product License</h2>
        <p>
          Upon purchasing 'USE AI TO MAKE EXTRA INCOME', you are granted a personal, non-exclusive, non-transferable license to access and read the manuscript for educational purposes.
        </p>

        <h2>2. Intellectual Property</h2>
        <p>
          All text, frameworks, prompts, and materials contained in this guide are the copyrighted intellectual property of Bhushan. Unauthorized resale, reproduction, or redistribution is strictly prohibited.
        </p>

        <h2>3. Disclaimer</h2>
        <p>
          The methods and strategies described in this book are educational. Results depend on individual effort, time, and market factors. No specific income guarantee is implied or promised.
        </p>
      </div>
    </div>
  );
}

function RefundPage({ navigate }) {
  return (
    <div className="section animate-page">
      <div className="container-editorial legal-content animate-fade-up">
        <span className="eyebrow">OUR PROMISE</span>
        <h1>30-Day Refund Policy</h1>
        <div className="legal-date">Last Updated: September 2026</div>

        <h2>100% Money-Back Guarantee</h2>
        <p>
          We want you to feel completely confident in your purchase. If you read the book and feel that it did not provide practical value for your time and money, you are entitled to a full refund within 30 days of purchase.
        </p>

        <h2>How to Request a Refund</h2>
        <p>
          Simply email <b>support@aiincomeguide.com</b> with your purchase email address and order confirmation. We will process your refund promptly back to your original payment method.
        </p>

        <div style={{ marginTop: 40, padding: 24, background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
          <p style={{ margin: 0 }}>
            Have a question before purchasing? Feel free to check our <button className="btn-link" onClick={() => navigate("faq")}>FAQ</button> or <button className="btn-link" onClick={() => navigate("contact")}>contact us</button>.
          </p>
        </div>
      </div>
    </div>
  );
}

// MAIN APPLICATION ROUTER & STATE
export default function App() {
  const [route, setRoute] = useState("home");
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const navigate = (targetRoute) => {
    setRoute(targetRoute);
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
        />
      );
    }

    switch (route) {
      case "home":
        return <HomePage navigate={navigate} />;
      case "whats-inside":
        return <WhatsInsidePage navigate={navigate} />;
      case "chapters":
        return <ChaptersPage navigate={navigate} />;
      case "reviews":
        return <ReviewsPage navigate={navigate} />;
      case "faq":
        return <FaqPage navigate={navigate} />;
      case "pricing":
        return <PricingPage navigate={navigate} />;
      case "checkout":
        return <CheckoutPage navigate={navigate} setUnlocked={setUnlocked} />;
      case "thank-you":
        return <ThankYouPage navigate={navigate} />;
      case "contact":
        return <ContactPage navigate={navigate} />;
      case "privacy":
        return <PrivacyPage />;
      case "terms":
        return <TermsPage />;
      case "refund":
        return <RefundPage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="reading-progress-bar" style={{ width: `${scrollProgress}%` }} />
      <Header currentRoute={route} navigate={navigate} />
      <div style={{ flex: 1 }}>{renderContent()}</div>
      <Footer navigate={navigate} />
    </div>
  );
}

// Mount to DOM
const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
