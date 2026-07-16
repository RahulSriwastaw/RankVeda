# RankVeda — Exam Page Pattern PRD

> **Version:** 2.1
> **Status:** Active
> **Last Updated:** 2026-07-16
> **Scope:** Exam landing pages + Marketplace auto-folder creation

---

## Table of Contents

1. [Overview](#1-overview)
2. [How to Add a New Exam](#2-how-to-add-a-new-exam)
3. [Marketplace Auto-Folder Creation](#3-marketplace-auto-folder-creation)
4. [Admin Panel — Marketplace Settings](#4-admin-panel--marketplace-settings)
5. [File Structure](#5-file-structure)
6. [Page Sections](#6-page-sections)
7. [SEO Checklist](#7-seo-checklist)
8. [Theme Colors](#8-theme-colors)
9. [Current Exam List](#9-current-exam-list)
10. [API Contracts](#10-api-contracts)
11. [Disclaimer Requirements](#11-disclaimer-requirements)

---

## 1. Overview

RankVeda har government exam ke liye:
- Ek **dedicated landing page** provide karta hai (Rank Predictor + Answer Key Calculator)
- Ek **Marketplace folder/section** automatically create hota hai jahan B2B buyers (Teachers/Orgs) us exam ke question bank packs kharid sakte hain.

**Architecture:** Config-driven — sirf `frontend/data/exams.js` mein ek object add karo, baaki sab automatic.

---

## 2. How to Add a New Exam

Sirf `frontend/data/exams.js` mein naya object add karo. Page automatically `/exams/<slug>` par available ho jata hai **aur** Marketplace mein us exam ka folder bhi create ho jata hai.

### Required Fields — `data/exams.js`

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | URL segment, e.g. `ssc-cpo-rank-predictor` |
| `examId` | number | Backend DB exam ID (primary key) |
| `name` | string | Short display name, e.g. `SSC CPO` |
| `fullName` | string | Official full name |
| `year` | string | Exam year, e.g. `2025` |
| `icon` | string | Emoji icon |
| `badge` | string | `Active` \| `Coming Soon` |
| `status` | string | `active` \| `coming-soon` |
| `themeColor` | string | `indigo` \| `red` \| `blue` \| `teal` \| `amber` \| `purple` \| `orange` \| `pink` |
| `conductedBy` | string | Conducting authority name |
| `bodyText` | string | Hero section subtitle (1–2 lines) |
| `descCard` | string | Exam listing card description |
| `sections[]` | array | `{ name, questions, marks, topics[] }` |
| `highlights[]` | array | `{ label, value }` — exam detail rows |
| `features[]` | array | `{ icon, text }` — hero card feature pills |
| `faq[]` | array | `{ q, a }` — min. 4 FAQ items |
| `seo` | object | All meta tags + JSON-LD structured data |
| `marketplace` | object | **Marketplace folder config (see Section 3)** |

---

## 3. Marketplace Auto-Folder Creation

Jab bhi koi naya exam `data/exams.js` mein add hota hai, us exam ke liye **Marketplace mein ek dedicated folder/section automatically create hota hai**.

### Folder Structure in Marketplace

```
Marketplace
├── RRB NTPC UG (2025)
│   ├── Shift 1 - 14 Jan 2025
│   ├── Shift 2 - 14 Jan 2025
│   └── ...
├── NTPC CBT-II (2025)
│   ├── Shift 1 - 20 Feb 2025
│   └── ...
├── SSC CGL (2025)          ← auto-created when exam added
│   └── (packs added by admin)
└── ...
```

### `marketplace` Config Object (in `data/exams.js`)

```js
marketplace: {
  enabled: true,              // true = folder visible in marketplace
  folderTitle: 'NTPC CBT-II 2025 Question Bank',
  folderDescription: 'Complete question bank for NTPC CBT-II 2025 with all shifts, detailed solutions and AI explanations.',
  disclaimer: 'These question papers are reconstructed from memory by candidates and are NOT official papers. RankVeda does not claim authorship or accuracy of these questions. Use for practice purposes only.',
  defaultPackPrice: 499,      // Default price in INR
  defaultPackCurrency: 'INR', // Real currency for B2B sales
}
```

### Marketplace Folder Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | ✅ | `true` = folder shown; `false` = hidden |
| `folderTitle` | string | ✅ | Title shown in marketplace folder card |
| `folderDescription` | string | ✅ | Short description under folder title |
| `disclaimer` | string | ✅ | Legal disclaimer shown on every pack in this folder |
| `defaultPackPrice` | number | ✅ | Default price (in INR) for new packs |
| `defaultPackCurrency` | string | ✅ | `'INR'` (real money via Razorpay) |

---

## 4. Admin Panel — Marketplace Settings

Marketplace is **B2B-focused** (for Teachers & Organizations). Instead of virtual points, sales happen in real currency (INR) via **Razorpay** integration.

### 4.1 Pack Creation & Multi-Exam Selection

When creating a new Question Bank Pack in the Admin Panel:
- **Exams Dropdown (Multi-select):** Admin can select one or multiple exams (e.g. `SSC CGL` + `SSC CHSL`) from the available exams list. 
- Selecting multiple exams creates a "Combo Pack" that pulls questions from all selected exams.

### 4.2 Pack-Level Settings (per Question Bank Pack)

| Setting | Who Sets | Description |
|---------|----------|-------------|
| **Pack Title** | Admin | Name of the pack e.g. "SSC All Exams Combo 2025" |
| **Pack Description** | Admin | Kya included hai — questions count, topics, difficulty |
| **Included Exams** | Admin | Dropdown to select multiple exams to pull questions from |
| **Price** | **Admin** | Price in INR (Direct Razorpay checkout) |
| **Disclaimer** | Auto/Admin | Shown on pack detail page and purchase confirmation |
| **Published / Draft** | Admin | Only published packs visible to buyers |
| **Total Questions** | Admin | Count of questions in pack |

### 4.3 Pricing & Payment Rules

- **B2B Audience:** Focuses on organizations needing bulk question data.
- **Pricing:** No virtual points. Only real money (**INR**).
- **Payment Gateway:** **Razorpay** integrated for seamless checkout.
- Admin sets the INR price; buyers pay via Razorpay to unlock the pack.

### 4.4 Admin Panel UI — Pack Editor

Admin panel mein marketplace packs create karne ka UI:

```
Admin Panel → Marketplace → Pack Management (Create / Edit)

1. Pack List View:
    ├── Shows all existing packs (Title, Price, Included Exams, Status)
    └── Action buttons: [Edit] | [Delete] | [Duplicate]

2. Create/Edit Pack Form:
    ├── Pack Settings
    │   ├── Title (editable)
    │   ├── Description (editable textarea)
    │   ├── Included Exams (Multi-select from Active/Coming Soon exams — can add/remove exams on edit)
    │   └── Price in INR (input — update anytime)
    │
    └── Publication
        ├── Disclaimer override (optional)
        └── Toggle: Publish / Draft
```

---

## 5. File Structure

```
frontend/
├── data/
│   └── exams.js              ← ✅ Edit only this to add new exams + marketplace config
└── pages/
    └── exams/
        ├── index.js           ← Exam listing (auto from config)
        └── [slug].js          ← Dynamic template (one file, all exams)

backend/
├── db/models.py               ← Exam, Pack, Question models
├── routes/
│   ├── questions.py           ← Pack purchase, unlock, AI generate
│   └── admin.py               ← Admin: create/edit/delete packs + pricing
└── services/
    └── marketplace.py         ← Marketplace folder auto-create logic
```

---

## 6. Page Sections

Every exam landing page auto-generates (in order):

1. **Navbar** — sticky, links to All Exams + Question Bank
2. **Breadcrumb** — SEO + UX navigation (Home › Exams › ExamName)
3. **Hero** — H1, live counter, feature pills, stat cards, **URL input form (rank predictor)**
4. **How it Works** — 3-step guide
5. **Exam Pattern** — subject-wise table + marking scheme + highlights table
6. **Topics Covered** — per-section topic chips
7. **Why RankVeda** — 6 feature cards (Instant Score, Section-wise, Live Rank, Score Card, AI Explanations, Free & Secure)
8. **FAQ** — accordion with Schema.org FAQPage markup
9. **Other Exams sidebar** — cross-linking
10. **Footer** — disclaimer note + links

---

## 7. SEO Checklist (per exam)

### Meta Tags
- [ ] `<title>` — `{ExamName} Rank Predictor {Year} — Score Calculator & Answer Key | RankVeda`
- [ ] `<meta name="description">` — 150–160 chars with exam name, year, key benefits
- [ ] `<meta name="keywords">` — 6–8 exam-specific keywords
- [ ] `<link rel="canonical">` — exact page URL
- [ ] `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">`

### Open Graph
- [ ] `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `og:locale`

### Twitter Cards
- [ ] `twitter:card`, `twitter:title`, `twitter:description`, `twitter:site`

### Schema.org JSON-LD (4 schemas required)
- [ ] `WebPage` — name, description, url, author, breadcrumb
- [ ] `Event` — exam event with organizer, status, attendance mode
- [ ] `FAQPage` — all FAQ items with Q&A
- [ ] `BreadcrumbList` — Home → Exams → ExamName

### Content SEO
- [ ] Single `<h1>` with exam name + "Rank Predictor" + year
- [ ] `<h2>` for each major section
- [ ] FAQs in natural question format
- [ ] Live candidate count (freshness signal)

---

## 8. Theme Colors

| Token | Gradient | Assigned To |
|-------|----------|-------------|
| `indigo` | Indigo → Purple | NTPC CBT-II |
| `red` | Red → Orange | RRB NTPC UG |
| `blue` | Blue → Indigo | SSC CGL |
| `purple` | Purple → Pink | SSC CHSL |
| `teal` | Teal → Cyan | RRB ALP |
| `amber` | Amber → Orange | IBPS PO |
| `orange` | Orange → Amber | RRB Group D |
| `pink` | Pink → Rose | SSC MTS |

---

## 9. Current Exam List

| Exam | Slug | Exam ID | Status | Marketplace |
|------|------|---------|--------|-------------|
| RRB NTPC UG CBT-I | `rrb-ntpc-ug` | 1 | ✅ Active | ✅ Enabled |
| NTPC CBT-II | `ntpc-cbt2-rank-predictor` | 7 | ✅ Active | ✅ Enabled |
| SSC CGL Tier-I | `ssc-cgl` | 2 | 🔜 Coming Soon | 🔜 Pending |
| SSC CHSL Tier-I | `ssc-chsl` | 3 | 🔜 Coming Soon | 🔜 Pending |
| RRB ALP CBT-I | `rrb-alp` | 4 | 🔜 Coming Soon | 🔜 Pending |
| RRB Group D | `rrb-group-d` | 5 | 🔜 Coming Soon | 🔜 Pending |
| IBPS PO Prelims | `ibps-po` | 6 | 🔜 Coming Soon | 🔜 Pending |
| SSC MTS Tier-I | `ssc-mts` | 8 | 🔜 Coming Soon | 🔜 Pending |

---

## 10. API Contracts

### Live Stats
```
GET /api/live-stats?exam=<examId>
Response: { totalViews: number }
```

### Result Page (on form submit)
```
GET /result?url=<encoded-response-url>&exam=<examId>
```

### Marketplace — Get Exam Folder
```
GET /api/marketplace/exams/<examId>/packs
Response: {
  folder: { title, description, disclaimer },
  packs: [ { id, title, price, currency, questionsCount, published, shift, date } ]
}
```

### Admin — Create/Update Pack
```
POST /api/admin/packs
Body: {
  examId, title, description, price, currency,
  disclaimer, questionsCount, shift, date, published
}

PATCH /api/admin/packs/<packId>
Body: { price, title, description, published, ... }
```

### Admin — Update Marketplace Folder Settings
```
PATCH /api/admin/exams/<examId>/marketplace
Body: {
  folderTitle, folderDescription, disclaimer,
  enabled, defaultPackPrice
}
```

---

## 11. Disclaimer Requirements

### Why Disclaimer is Mandatory

Question bank packs on RankVeda are **reconstructed memory-based papers** — NOT official question papers. Disclaimer is legally required to:
1. Protect RankVeda from copyright claims by exam authorities
2. Set correct expectations with students
3. Comply with applicable laws

### Standard Disclaimer Text (default for all exams)

> ⚠️ **Disclaimer:** The question papers and solutions available in this Question Bank are reconstructed from memory by exam candidates and are **NOT** official question papers issued by the conducting authority. RankVeda does not claim ownership, accuracy, or completeness of these questions. These materials are provided for practice and self-assessment purposes only. RankVeda is not affiliated with or endorsed by any government exam authority.

### Per-Exam Disclaimer (override in `marketplace.disclaimer`)

Exams can have custom disclaimer text — e.g., for RRB exams:

> ⚠️ **Disclaimer:** This question bank is based on candidate memory recall and is not an official paper from Railway Recruitment Board (RRB). RankVeda is not affiliated with RRB or Indian Railways. Use for practice only.

### Where Disclaimer Appears

| Location | Display |
|----------|---------|
| Marketplace folder card | Small disclaimer text below description |
| Pack detail page | Prominent yellow/amber alert box before purchase |
| Purchase confirmation modal | User must tick "I understand" checkbox |
| Downloaded score card | Footer text |
| Admin panel (pack editor) | Disclaimer preview when creating pack |

### Admin Can Edit Disclaimer

- **Default** — pulled from `marketplace.disclaimer` in `data/exams.js`
- **Override** — Admin can edit per-exam disclaimer in Admin Panel → Exams → Marketplace Tab → Disclaimer field
- **Per-pack** — Admin can also set a custom disclaimer per pack (optional)

---

## 12. Quick Copy — Minimal Exam Config with Marketplace

```js
// In frontend/data/exams.js
{
  slug: 'exam-slug-rank-predictor',
  examId: 10,
  name: 'Exam Name',
  fullName: 'Full Official Exam Name',
  year: '2025',
  icon: '📋',
  badge: 'Coming Soon',     // change to 'Active' when live
  status: 'coming-soon',    // change to 'active' when live
  color: 'from-blue-600/10 to-indigo-600/10',
  border: 'border-blue-700/30',
  badgeColor: 'bg-blue-900/50 text-blue-400 border-blue-800',
  themeColor: 'blue',
  conductedBy: 'Exam Authority Name',
  bodyText: 'One-line description of what user can do.',
  descCard: 'X questions | Y min | subjects. Short CTA.',

  sections: [
    { name: 'Subject 1', questions: 25, marks: 25, topics: ['Topic A', 'Topic B'] },
  ],

  highlights: [
    { label: 'Duration', value: '60 Minutes' },
    { label: 'Total Questions', value: '100' },
    { label: 'Negative Marking', value: '0.25 marks per wrong answer' },
  ],

  features: [
    { icon: '⚡', text: 'Instant Result' },
    { icon: '📊', text: 'Section-wise' },
    { icon: '🏆', text: 'Live Rank' },
  ],

  faq: [
    { q: 'Question?', a: 'Answer.' },
  ],

  seo: {
    title: 'Exam Rank Predictor 2025 — Score Calculator & Answer Key | RankVeda',
    description: '160-char description.',
    keywords: 'exam rank predictor 2025, exam score calculator',
    ogTitle: 'Exam Rank Predictor 2025 | RankVeda',
    ogDesc: 'OG description.',
    twitterTitle: 'Exam Rank Predictor 2025 | RankVeda',
    twitterDesc: 'Twitter description.',
    eventName: 'Exam Name 2025',
    eventDesc: 'One sentence about exam.',
  },

  // ✅ Marketplace folder — auto-created when exam is added
  marketplace: {
    enabled: false,           // set to true when ready to show packs
    folderTitle: 'Exam Name 2025 Question Bank',
    folderDescription: 'Complete question bank for Exam Name 2025 with all shifts, solutions and AI explanations.',
    disclaimer: 'These question papers are reconstructed from memory by candidates and are NOT official papers. RankVeda does not claim authorship or accuracy. Use for practice only.',
    defaultPackPrice: 49,     // Admin can override per pack from Admin Panel
    defaultPackCurrency: 'points',
  },
}
```
