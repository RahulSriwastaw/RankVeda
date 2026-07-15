# RankVeda Backend — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Status:** Approved  
> **Last Updated:** 2026-07-15  
> **Tech Stack:** Python 3.10+ · Flask · SQLAlchemy · SQLite (dev) / PostgreSQL (prod) · Redis · Gemini AI · Stripe · JWT

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Architecture](#2-system-architecture)
3. [Core Features](#3-core-features)
4. [Module Breakdown](#4-module-breakdown)
5. [API Endpoints](#5-api-endpoints)
6. [Database Design](#6-database-design)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Payment & Points System](#8-payment--points-system)
9. [AI Integration](#9-ai-integration)
10. [Scraping & Parsing Engine](#10-scraping--parsing-engine)
11. [Caching & Real-Time Stats](#11-caching--real-time-stats)
12. [Admin Panel](#12-admin-panel)
13. [Deployment & DevOps](#13-deployment--devops)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Future Roadmap](#15-future-roadmap)

---

## 1. Product Overview

### 1.1 Purpose
RankVeda is a web application that allows competitive exam aspirants (SSC, RRB, Banking, etc.) to:
- Upload/submit their exam result URLs/HTML and get a parsed, structured view of their performance.
- View detailed question-by-question analysis with correct/incorrect/unattempted breakdown.
- Unlock AI-powered explanations for wrong answers.
- Browse a marketplace of question banks organized by exam and shift.
- Earn and spend virtual points to unlock content.
- Track live rank and percentile among all users.

### 1.2 Target Users
| User Type | Description |
|---|---|
| **End User (Student)** | Competes in exams, uploads results, views analysis, purchases question banks |
| **Admin** | Manages users, exams, questions, packs, transactions; uses AI tools for question cleanup |

### 1.3 Key Metrics
- Total Users
- Total Results Parsed
- Questions in Master Database
- Points Earned / Spent
- Marketplace Sales (packs purchased)
- AI Solutions Generated per day

---

## 2. System Architecture

```
┌─────────────┐     ┌─────────────────────────────────────┐     ┌─────────┐
│  Frontend   │────▶│         Flask Backend (REST API)     │────▶│ SQLite  │
│ (Next.js)   │     │                                     │     │ / PG    │
│             │     │  app.py · routes/ · services/ · db/  │     │         │
└─────────────┘     │                                     │     └─────────┘
       │            │  middleware/auth.py · utils/         │     ┌─────────┐
       │            └─────────────────────────────────────┘────▶│ Redis   │
       │                           │                            └─────────┘
       │                           │
       ▼                           ▼
  Stripe.js               ┌──────────────────┐
  (Payments)              │  External APIs   │
                          │  ─ Gemini AI     │
                          │  ─ RRB digialm   │
                          └──────────────────┘
```

### 2.1 Directory Structure
```
backend/
├── app.py                     # Flask app factory, blueprint registration
├── config.py                  # Environment config loader
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (not committed)
├── clear_db.py               # DB utility to clear all data
├── api_test.py               # API smoke tests
│
├── db/
│   ├── __init__.py
│   ├── models.py              # All SQLAlchemy ORM models
│   ├── pool.py                # DB init helper
│   ├── schema.sql             # Raw SQL schema backup
│   ├── migrate_options.py     # Migration utilities
│   └── migrate_questions.py   # Question migration scripts
│
├── routes/
│   ├── __init__.py
│   ├── auth.py                # Register/Login/Me endpoints
│   ├── results.py             # Result parsing & live rank
│   ├── questions.py           # Question unlock, AI generate, publish, like
│   ├── user.py                # Points balance, Stripe webhook
│   ├── live_stats.py          # Live view count
│   ├── marketplace.py         # Exams, packs, purchases
│   └── admin/
│       ├── __init__.py
│       └── admin.py           # Full admin CRUD + dashboard
│
├── services/
│   ├── scraper.py             # HTML fetch + RRB/digialm result parsing
│   ├── ai_service.py          # Gemini AI integration (solutions + question editing)
│   ├── points_service.py      # Points wallet business logic
│   └── marketplace_service.py # Question pack creation & purchase logic
│
├── middleware/
│   └── auth.py                # (reserved for middleware decorators)
│
├── utils/
│   └── redis_client.py        # Redis client with in-memory fallback
│
└── tests/
    ├── test_scraper.py
    ├── test_ai_service.py
    └── test_marketplace_packs.py
```

---

## 3. Core Features

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| 1 | **Result Parsing** | P0 | Accept URL or raw HTML → parse RRB/digialm result → store structured data |
| 2 | **Question Bank** | P0 | Master questions deduplicated by hash, linked to exam shifts |
| 3 | **Live Rank** | P1 | Rank & percentile calculation relative to all users for an exam |
| 4 | **AI Explanations** | P1 | Gemini-generated solution for wrong answers (costs points) |
| 5 | **User Auth** | P0 | JWT-based registration, login, session management |
| 6 | **Points Wallet** | P0 | Virtual currency: earn, spend, recharge via Stripe |
| 7 | **Marketplace** | P0 | Browse/shop exam question banks and packs |
| 8 | **Admin Dashboard** | P0 | CRUD for users, exams, questions, packs; AI bulk editing |
| 9 | **Live Stats** | P2 | Real-time view count via Redis |
| 10 | **CSV Export** | P1 | Export questions to CSV from marketplace |

---

## 4. Module Breakdown

### 4.1 `app.py` — Application Factory
- **Responsibility:** Create Flask app, load config, init DB, register all blueprints, set up error handlers.
- **Blueprints Registered:**
  - `results_bp` → `/api/results`
  - `questions_bp` → `/api/questions`
  - `user_bp` → `/api/user`
  - `live_stats_bp` → `/api/live-stats`
  - `admin_bp` → `/api/admin`
  - `auth_bp` → `/api/auth`
  - `marketplace_bp` → `/api/marketplace`
- **Error Handlers:** 404 → `{'error': 'Not found'}`, 500 → `{'error': 'Internal server error'}`

### 4.2 `config.py` — Configuration
- Loads from `.env` via `python-dotenv`
- Keys: `SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `CLAUDE_API_KEY` (legacy), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SQLALCHEMY_TRACK_MODIFICATIONS = False`

### 4.3 `db/models.py` — Data Models

#### Exam
| Field | Type | Notes |
|---|---|---|
| id | Integer PK | Auto-increment |
| name | String(100) | Exam name (e.g. "RRB NTPC CBT-1") |
| date | Date | Exam date |
| total_questions | Integer | Default 100 |
| price | Integer | Points required to access question bank |
| description | Text | Marketplace description |

#### MasterQuestion
| Field | Type | Notes |
|---|---|---|
| id | Integer PK | |
| question_id_html | String(100) | Unique HTML question ID |
| question_hash | String(64) | SHA-256 of question text, unique indexed |
| question_text | Text | The actual question |
| correct_answer | String(10) | A/B/C/D or 1/2/3/4 |
| correct_option_text | Text | Full text of correct option |
| option_a/b/c/d_text | Text | Option text |
| option_a/b/c/d_id | String(50) | Option HTML IDs |
| parsed_payload | JSON | Full raw parsed data |
| reference_count | Integer | How many times this question appeared |
| shifts | JSON | List of `{exam_id, test_date, test_time, subject}` |
| shift_count | Integer | Number of unique shifts |
| created_at / updated_at | DateTime | Timestamps |

#### ExamResult
| Field | Type | Notes |
|---|---|---|
| id | Integer PK | |
| user_id | FK users | Nullable |
| exam_id | FK exams | |
| registration_number | String(50) | |
| roll_number | String(50) | Not null, indexed |
| candidate_name | String(200) | |
| community | String(50) | |
| test_centre_name | String(300) | |
| test_date / test_time | String | |
| subject | String(200) | |
| photo_url | String(500) | |
| application_photograph | String(500) | |
| candidate_payload | JSON | |
| source_html | Text | Raw HTML source |
| parser_version | String(50) | |
| parsed_at | DateTime | |
| score | Numeric(5,2) | |
| rank | Integer | |
| percentile | Numeric(5,2) | |
| category_rank | Integer | |
| category | String(10) | |
| section_wise | JSON | Per-section breakdown |
| total_correct/wrong/unattempted | Integer | |
| created_at | DateTime | |

#### QuestionResponse
| Field | Type | Notes |
|---|---|---|
| id | Integer PK | |
| result_id | FK exam_results | |
| question_no | Integer | Question number in the exam |
| master_question_id | FK master_questions | |
| option_id | String(50) | |
| student_answer | String(10) | A/B/C/D or numeric |
| student_option_text | Text | |
| parsed_payload | JSON | |
| marks_awarded | Numeric(3,1) | |
| difficulty | String(10) | |
| status | String(20) | correct / wrong / unattempted |
| Unique Constraint | (result_id, question_no) | Prevents duplicates |

#### AISolution
| Field | Type | Notes |
|---|---|---|
| id | Integer PK | |
| master_question_id | FK | |
| user_id | FK (nullable) | Who published |
| explanation | Text | AI-generated explanation |
| why_wrong | Text | Why the student's answer is wrong |
| key_takeaways | JSON | List of bullet points |
| similar_questions_url | Text | |
| likes | Integer | Default 0 |
| created_at | DateTime | |

#### User
| Field | Type | Notes |
|---|---|---|
| id | Integer PK | |
| email | String(255) | Unique, not null |
| password_hash | Text | SHA-256 |
| name | String(100) | |
| created_at | DateTime | |

#### UserPoints
| Field | Type | Notes |
|---|---|---|
| user_id | PK + FK | One-to-one with users |
| balance | Integer | Current balance |
| total_earned | Integer | Lifetime earnings |
| total_spent | Integer | Lifetime spend |
| updated_at | DateTime | |

#### PointsTransaction
| Field | Type | Notes |
|---|---|---|
| id | Integer PK | |
| user_id | FK | |
| type | String(20) | earn / spend / recharge |
| amount | Integer | |
| description | Text | |
| reference_id | Integer | (exam_id / pack_id) |
| created_at | DateTime | Indexed |

#### QuestionPack
| Field | Type | Notes |
|---|---|---|
| id | Integer PK | |
| name | String(200) | Pack title |
| description | Text | |
| price | Integer | Points cost |
| exam_ids | JSON | List of exam IDs included |
| is_active | Boolean | Soft-delete toggle |
| created_at | DateTime | |

#### ExamPurchase
| Field | Type | Notes |
|---|---|---|
| id | Integer PK | |
| user_id | FK | |
| exam_id | FK | |
| purchased_at | DateTime | |
| Unique Constraint | (user_id, exam_id) | One purchase per exam per user |

#### UserUnlockedQuestion
| Field | Type | Notes |
|---|---|---|
| id | Integer PK | |
| user_id | FK | |
| master_question_id | FK | |
| Unique Constraint | (user_id, master_question_id) | |

### 4.4 Routes

#### `routes/auth.py` — Authentication
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | No | Register new user, create wallet |
| `/api/auth/login` | POST | No | Login, return JWT token |
| `/api/auth/me` | GET | Yes | Get current user profile + balance |

- Password hashing: SHA-256
- JWT: HS256, 30-day expiry
- Helper: `get_current_user()` extracts user from `Authorization: Bearer <token>`

#### `routes/results.py` — Result Parsing
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/results` | POST | No | Submit URL or raw HTML → parse & store |
| `/api/results/` | POST | No | Same (trailing slash) |
| `/api/results/rank` | GET | No | Calculate live rank for a given score |

- **Deduplication:** By roll_number + exam_id or registration_number + exam_id
- **Master Question Mapping:** Deduplicates questions by `question_id_html` or SHA-256 hash
- **Shift Tracking:** Each question tracks which exam/date/time/subject it appeared in

#### `routes/questions.py` — AI Solutions
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/questions/<result_id>/questions/<q_id>/unlock` | POST | Yes | Unlock a question (costs 5 points) |
| `/api/questions/<result_id>/questions/<q_id>/generate` | POST | Yes | Generate AI solution (costs 5 points) |
| `/api/questions/<result_id>/questions/<q_id>/publish` | POST | Yes | Publish temp solution (max 5 per question) |
| `/api/questions/solutions/<sol_id>/like` | POST | No | Like a solution |

- Points: 5 per unlock, 5 per AI generate
- Max 5 published solutions per question

#### `routes/user.py` — User & Payments
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/user/<user_id>/points` | GET | No | Get points balance |
| `/api/user/stripe-webhook` | POST | No (Stripe) | Stripe webhook: adds points on payment success |

#### `routes/live_stats.py` — Live Stats
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/live-stats` | GET | No | Get total view count for an exam |

#### `routes/marketplace.py` — Marketplace
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/marketplace/packs` | GET | No | List active question packs |
| `/api/marketplace/exams` | GET | No | List exams with question counts & purchase status |
| `/api/marketplace/exams/<id>/shifts` | GET | No | List shifts for an exam |
| `/api/marketplace/exams/<id>/questions` | GET | No | Paginated questions with shift filters & CSV export |
| `/api/marketplace/packs/<id>/purchase` | POST | Yes | Purchase a question pack |
| `/api/marketplace/purchase` | POST | Yes | Purchase single exam |
| `/api/marketplace/my-purchases` | GET | Yes | List user's purchased exams |

- **Access Control:** Unpurchased exams show masked options (••••)
- **CSV Export:** `?export=csv` returns CSV file

#### `routes/admin/admin.py` — Admin Panel

**Dashboard:**
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/dashboard` | GET | Overall stats (users, exams, results, questions, points) |

**Users:**
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/users` | GET | List users (paginated, searchable, sortable) |
| `/api/admin/users/<id>` | GET | User detail with transactions & results |
| `/api/admin/users/<id>/points` | POST | Adjust points balance |
| `/api/admin/users/bulk-delete` | POST | Bulk delete users |

**Exams:**
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/exams` | GET/POST | List / Create exams |
| `/api/admin/exams/<id>` | PUT/DELETE | Update / Delete exam |
| `/api/admin/exams/bulk-delete` | POST | Bulk delete exams |

**Packs:**
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/packs` | GET/POST | List / Create question packs |
| `/api/admin/packs/<id>` | PUT/DELETE | Update / Delete pack |

**Results:**
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/results` | GET | List results (paginated, filterable) |
| `/api/admin/results/<id>` | GET/DELETE | Get detail / Delete result |
| `/api/admin/results/bulk-delete` | POST | Bulk delete results |

**Questions:**
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/questions` | GET | List QuestionResponses |
| `/api/admin/master-questions` | GET | List MasterQuestions (advanced filters) |
| `/api/admin/master-questions/<id>` | GET/PUT/DELETE | CRUD for individual master question |
| `/api/admin/master-questions/<id>/ai-edit` | POST | AI-edit a single question |
| `/api/admin/master-questions/bulk-ai-edit` | POST | Bulk AI-edit (max 50) |
| `/api/admin/master-questions/bulk-delete` | POST | Bulk delete questions |

**Transactions:**
| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/transactions` | GET | List all points transactions |

### 4.5 Services

#### `services/scraper.py`
- **`fetch_html(url, use_curl=True)`** — Fetches HTML using `curl_cffi` (mimics Chrome 120) with fallback to `requests`.
- **`parse_result_html(html)`** — Parses RRB/digialm HTML using BeautifulSoup:
  - Extracts candidate info from `main-info-tbl` (roll number, name, community, centre, date, time, subject, rank, percentile, score, category)
  - Extracts photo URL
  - Parses question panels (`question-pnl`, `questionRowTbl`, `menu-tbl`)
  - For each question: extracts text, options (A/B/C/D), IDs, correct answer, student answer
  - Calculates marks (1 for correct, -1/3 for wrong, 0 for unattempted)
  - Builds section-wise summary table
- **Key Design Decisions:**
  - Horizontal AND vertical table layouts supported
  - Section summary parsed from HTML table OR derived from question tags
  - All HTML attributes preserved in `html_fields` and `parsed_payload`
  - Option values normalized via `_normalize_option_value()`

#### `services/ai_service.py`
- **`generate_solution(question_no, correct_answer, student_answer, ...)`**:
  - Uses Gemini API (`gemini-2.0-flash`) with JSON response mode
  - Falls back to `_build_fallback_solution()` if API key missing or API fails
  - Returns: `{explanation, why_wrong, key_takeaways, similar_questions_url}`
- **`ai_edit_question(question_data)`** — Uses Gemini to clean/improve question text, options, spelling, artifacts
- **`bulk_ai_edit_questions(questions, delay_seconds)`** — Batch edits with rate limiting (default 0.5s delay)

#### `services/points_service.py`
- **`get_balance(user_id)`** — Get or create wallet
- **`deduct_points(user_id, amount, description)`** — Spend points (raises ValueError if insufficient)
- **`add_points(user_id, amount, description, txn_type)`** — Earn/recharge points
- All operations create a `PointsTransaction` record

#### `services/marketplace_service.py`
- **`create_question_pack(db_session, name, description, price, exam_ids)`** — Creates a new question pack
- **`purchase_question_pack(db_session, user_id, pack)`** — Purchases a pack: validates balance, creates ExamPurchase records for each exam, deducts points

### 4.6 Utilities

#### `utils/redis_client.py`
- **Redis:** Connected via URL from config, with in-memory dictionary fallback if Redis unavailable
- **`increment_view_count(exam_id)`** — Live exam view counter
- **`get_view_count(exam_id)`** — Retrieve counter
- **`update_leaderboard(exam_id, roll_number, score)`** — Sorted set for rank tracking
- **`get_top_100(exam_id)`** — Top 100 students by score

---

## 5. API Endpoints — Complete Reference

### 5.1 Authentication
```
POST   /api/auth/register          {email, password, name?}        → {token, user}
POST   /api/auth/login             {email, password}               → {token, user}
GET    /api/auth/me                [Bearer Token]                  → {id, email, name, balance}
```

### 5.2 Results
```
POST   /api/results                {url, exam_id?}                 → {result, questions}
GET    /api/results/rank           ?exam_id&score                  → {rank, total_appeared, percentile}
```

### 5.3 Questions & AI Solutions
```
POST   /api/questions/<r_id>/questions/<q_id>/unlock              → {solutions, isUnlocked, newBalance}
POST   /api/questions/<r_id>/questions/<q_id>/generate            → {solution, newBalance}
POST   /api/questions/<r_id>/questions/<q_id>/publish             → {success, solution}
POST   /api/questions/solutions/<sol_id>/like                     → {success, likes}
```

### 5.4 User
```
GET    /api/user/<user_id>/points                                 → {balance}
POST   /api/user/stripe-webhook                                   → 200 (Stripe event)
```

### 5.5 Live Stats
```
GET    /api/live-stats        ?exam=1                             → {totalViews}
```

### 5.6 Marketplace
```
GET    /api/marketplace/packs                                     → {packs}
GET    /api/marketplace/exams                                     → {exams}
GET    /api/marketplace/exams/<id>/shifts                         → {exam, shifts, is_purchased}
GET    /api/marketplace/exams/<id>/questions  ?page&per_page&shift_date&shift_time&shift_subject&search&export=csv
                                                                    → {exam, questions, total, pages, is_purchased}
POST   /api/marketplace/packs/<id>/purchase                       → {success, new_balance, purchased_exam_ids}
POST   /api/marketplace/purchase             {exam_id}            → {success, new_balance}
GET    /api/marketplace/my-purchases                               → {purchases}
```

### 5.7 Admin
```
GET    /api/admin/dashboard                                        → {total_users, total_exams, ...}
GET    /api/admin/users                            ?page&per_page&search&sort_by&date_from&date_to
GET    /api/admin/users/<id>                                        → {user, points, transactions, results}
POST   /api/admin/users/<id>/points              {amount, description, type}
POST   /api/admin/users/bulk-delete              {ids}

GET    /api/admin/exams                                             → {exams}
POST   /api/admin/exams                            {name, date, total_questions}
PUT    /api/admin/exams/<id>                      {name, date, total_questions}
DELETE /api/admin/exams/<id>
POST   /api/admin/exams/bulk-delete               {ids}

GET    /api/admin/packs                                             → {packs}
POST   /api/admin/packs                           {name, description, price, exam_ids}
PUT    /api/admin/packs/<id>                      {name, description, price, exam_ids, is_active}
DELETE /api/admin/packs/<id>

GET    /api/admin/results                         ?page&per_page&exam_id&search
GET    /api/admin/results/<id>                                        → {result, stats, questions}
DELETE /api/admin/results/<id>
POST   /api/admin/results/bulk-delete             {ids}

GET    /api/admin/questions                       ?page&per_page&exam_id&result_id
GET    /api/admin/master-questions                ?page&per_page&search&has_solution&subject&shift_date&sort_by&correct_answer
GET    /api/admin/master-questions/<id>                               → full question detail with responses
PUT    /api/admin/master-questions/<id>           {question_text, correct_answer, ...}
DELETE /api/admin/master-questions/<id>
POST   /api/admin/master-questions/<id>/ai-edit   {auto_apply?}
POST   /api/admin/master-questions/bulk-ai-edit   {ids, auto_apply?}
POST   /api/admin/master-questions/bulk-delete    {ids}

GET    /api/admin/transactions                    ?page&per_page&user_id
```

---

## 6. Database Design

### 6.1 Entity-Relationship Diagram (Textual)
```
users 1──* exam_results (* FK user_id nullable)
users 1──1 user_points
users 1──* points_transactions
users 1──* ai_solutions (publisher)
users 1──* user_unlocked_questions
users 1──* exam_purchases

exams 1──* exam_results
exams 1──* exam_purchases
exams *──* master_questions (via shifts JSON)
exams *──* question_packs (via exam_ids JSON)

master_questions 1──* question_responses
master_questions 1──* ai_solutions
master_questions 1──* user_unlocked_questions

exam_results 1──* question_responses
```

### 6.2 Indexes
| Table | Index | Type |
|---|---|---|
| exam_results | idx_exam_results_roll (roll_number) | Single |
| exam_results | idx_exam_results_exam (exam_id) | Single |
| question_responses | idx_q_responses_result (result_id) | Single |
| question_responses | uq_result_question (result_id, question_no) | Unique |
| master_questions | question_id_html | Unique |
| master_questions | question_hash | Unique |
| user_unlocked_questions | _user_question_uc (user_id, master_question_id) | Unique |
| exam_purchases | uq_user_exam_purchase (user_id, exam_id) | Unique |
| points_transactions | idx_txn_user (user_id) | Single |
| points_transactions | idx_txn_created (created_at) | Single |

### 6.3 Referential Integrity
- All foreign keys use `ON DELETE CASCADE` except users → exam_results (`SET NULL`)
- CASCADE ensures deleting an exam/result/question cascades to related records

---

## 7. Authentication & Authorization

### 7.1 Flow
1. **Register:** User submits email + password → hashed (SHA-256) → stored → wallet created → JWT returned
2. **Login:** Email + password → verify hash → JWT returned
3. **Authenticated Requests:** `Authorization: Bearer <jwt>` header → `verify_token()` → `User` object
4. **JWT Payload:** `{user_id, email, exp (30 days), iat}`

### 7.2 Admin Access
- Currently no admin role check — any authenticated user can call admin endpoints
- **Future:** Add role-based access control (RBAC)

### 7.3 Security Notes
- Passwords hashed with SHA-256 (not bcrypt — consider upgrading for production)
- JWT secret from `JWT_SECRET` env var
- Stripe webhook verified via signature

---

## 8. Payment & Points System

### 8.1 Points Economy
| Action | Points Change | Type |
|---|---|---|
| Initial registration | 0 | — |
| Stripe recharge | +X (configurable) | recharge |
| Unlock a question | -5 | spend |
| Generate AI solution | -5 | spend |
| Purchase exam bank | -price | spend |
| Purchase question pack | -price | spend |
| Admin adjustment | ±X | earn/spend |

### 8.2 Stripe Integration
- **Checkout Session:** Created on frontend with metadata `{user_id, points, plan_name}`
- **Webhook:** `/api/user/stripe-webhook` listens for `checkout.session.completed`
- Points are credited only after Stripe verifies the payment via webhook signature

### 8.3 Transaction Logging
Every points change creates a `PointsTransaction` record with:
- Type (earn/spend/recharge)
- Amount
- Description
- Reference ID (exam_id or pack_id for spend transactions)

---

## 9. AI Integration

### 9.1 Gemini AI Setup
- **Model:** `gemini-2.0-flash` (configurable via `GEMINI_MODEL`)
- **API Key:** `GEMINI_API_KEY` from environment
- **Temperature:** 0.2 (low creativity for factual accuracy)
- **Response Format:** JSON mode (`response_mime_type: application/json`)

### 9.2 AI Solution Generation
```
Prompt: Expert exam coach analyzes wrong answer
       → Returns JSON: {explanation, why_wrong, key_takeaways[], similar_questions_url}
Fallback: Template-based explanation when API unavailable
```

### 9.3 AI Question Editing
```
Prompt: Clean/improve question text, fix HTML artifacts, correct spelling
       → Returns JSON: {question_text, option_a..d, correct_answer, notes}
Rate Limiting: 0.5s delay between bulk edits (max 50 per request)
```

---

## 10. Scraping & Parsing Engine

### 10.1 HTML Fetching
- Primary: `curl_cffi` with Chrome 120 impersonation (bypasses bot detection)
- Fallback: `requests` library
- Headers include realistic User-Agent, Accept-Language, etc.

### 10.2 Supported Exam Format
- RRB (Railway Recruitment Board) — digialm.com format
- TCS iON-based exams
- **Key HTML Structures Parsed:**
  - `table.main-info-tbl` → Candidate details
  - `div.question-pnl` / `table.questionRowTbl` / `table.menu-tbl` → Questions
  - `td.rightAns` → Correct answer
  - `td.wrngAns` → Student's wrong answers
  - Section summary table → Section-wise breakdown

### 10.3 Deduplication Strategy
1. **ExamResults:** By `roll_number + exam_id` or `registration_number + exam_id`
2. **MasterQuestions:** First by `question_id_html` (HTML attribute), then by SHA-256 hash of question text
3. **Shifts:** Each question's shifts array ensures no duplicate shift entries

---

## 11. Caching & Real-Time Stats

### 11.1 Redis Usage
| Feature | Redis Key | Type | Description |
|---|---|---|---|
| View Counter | `exam:{exam_id}:views` | String | Incremented on each result view |
| Leaderboard | `exam:{exam_id}:leaderboard` | Sorted Set | Score → rank mapping |

### 11.2 Fallback
If Redis is unavailable, the system falls back to in-memory Python dictionaries (`_local_views`, `_local_leaderboard`). Data is lost on server restart.

---

## 12. Admin Panel

### 12.1 Dashboard Metrics
- Total Users, Exams, Results, Master Questions, AI Solutions
- Total Points Earned / Spent
- Today's New Results, Today's New Users

### 12.2 Management Features
| Section | Capabilities |
|---|---|
| **Users** | List (paginated, search by email/name, sort by date/balance, filter by date range), detail view, points adjustment, bulk delete |
| **Exams** | CRUD, bulk delete |
| **Packs** | CRUD with exam associations, activation toggle |
| **Results** | List with filters (exam, search by roll/name/centre), detail with question list, bulk delete |
| **Master Questions** | Advanced filters (search, subject, shift date, correct answer, has solution), detail with all student responses, AI edit (single/bulk 50 max), manual edit, bulk delete |
| **Transactions** | List all, filter by user |

### 12.3 AI Tools for Admin
- **Single AI Edit:** Cleans/improves one question's text and options
- **Bulk AI Edit:** Up to 50 questions at once with rate limiting
- **Auto-Apply Option:** Automatically saves AI suggestions to DB

---

## 13. Deployment & DevOps

### 13.1 Requirements
```
Flask==2.3.3
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.0.5
redis==4.6.0
python-dotenv==1.0.0
requests==2.31.0
beautifulsoup4==4.12.2
stripe==5.4.0
PyJWT==2.8.0
curl_cffi>=0.6.0
```

### 13.2 Environment Variables (.env)
```
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///instance/rankveda.db
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your-gemini-api-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your-jwt-secret
```

### 13.3 Docker Support
- `docker-compose.yml` available at project root
- Containers: web (Flask), db (PostgreSQL), redis

### 13.4 Database Migrations
- Current: Manual schema via `schema.sql` and migration scripts (`migrate_options.py`, `migrate_questions.py`)
- Recommendation: Add Flask-Migrate (Alembic) for production

### 13.5 Testing
- Test files in `backend/tests/`
- `test_scraper.py` — Parser correctness
- `test_ai_service.py` — AI generation fallback logic
- `test_marketplace_packs.py` — Pack purchase flow

---

## 14. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| **Performance** | Result parsing < 5s; API response < 500ms for cached results |
| **Scalability** | Horizontal scaling via stateless Flask + shared PostgreSQL + Redis |
| **Availability** | Graceful degradation when Redis/AI unavailable |
| **Data Integrity** | Unique constraints prevent duplicate results, questions, purchases |
| **Security** | JWT auth, Stripe webhook verification, password hashing |
| **Maintainability** | Modular blueprint structure, separation of concerns (routes/services/db) |
| **Error Handling** | Consistent JSON error responses with HTTP status codes |

---

## 15. Future Roadmap

### Phase 2 (Short-term)
- [ ] **Flask-Migrate (Alembic):** Replace manual migrations with proper version control
- [ ] **Role-Based Access Control (RBAC):** Admin/user separation with decorators
- [ ] **Rate Limiting:** Per-user API rate limits to prevent abuse
- [ ] **Password Upgrade:** Switch from SHA-256 to bcrypt/argon2
- [ ] **Comprehensive Test Suite:** 80%+ code coverage
- [ ] **Swagger/OpenAPI Docs:** Auto-generated API documentation

### Phase 3 (Medium-term)
- [ ] **WebSocket Live Updates:** Real-time rank updates via Socket.IO
- [ ] **Multiple Exam Parser Plugins:** Pluggable parsers for different exam portals
- [ ] **AI-Generated Practice Questions:** Generate similar questions from existing ones
- [ ] **Bulk Result Upload:** CSV/Excel batch upload for institutions
- [ ] **Notification System:** Email/SMS alerts for new results, rank changes
- [ ] **Analytics Dashboard:** Student performance trends, weak areas, improvement tracking

### Phase 4 (Long-term)
- [ ] **Multi-language Support:** Hindi, Tamil, Telugu, Bengali question display
- [ ] **Mobile Push Notifications:** Integration with Android/iOS apps
- [ ] **Leaderboard Gamification:** Badges, streaks, daily challenges
- [ ] **Institutional Accounts:** Batch management for coaching centers
- [ ] **Carbon Copy (CC) Result Sharing:** Share results with teachers/parents
- [ ] **AI Chat Tutor:** Conversational AI for doubt resolution

---

## Appendix

### A. Glossary
| Term | Definition |
|---|---|
| **Shift** | A unique combination of exam_id + test_date + test_time + subject |
| **Master Question** | Single question deduplicated across all exams and shifts |
| **Question Pack** | A bundle of multiple exams sold together at a discounted price |
| **Points** | Virtual currency used to unlock content |
| **Parser** | HTML parsing engine that extracts structured data from exam result pages |

### B. Error Codes
| HTTP Code | Meaning | Example |
|---|---|---|
| 400 | Bad Request | Missing URL, invalid JSON |
| 401 | Unauthorized | Missing/invalid JWT token |
| 402 | Payment Required | Insufficient points |
| 403 | Forbidden | Question not unlocked |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate email/result |
| 500 | Internal Error | Unexpected server error |

### C. Data Flow Diagrams

**Result Upload Flow:**
```
User → POST /api/results {url}
  → fetch_html(url) → parse_result_html(html)
  → Deduplicate by roll_number
  → Create/Update ExamResult
  → For each question:
      → Deduplicate by question_id_html/hash
      → Create/Update MasterQuestion (increment reference_count, add shift)
      → Create QuestionResponse
  → Return {result, questions}
```

**Marketplace Purchase Flow:**
```
User → POST /api/marketplace/purchase {exam_id}
  → Authenticate (JWT)
  → Check ExamPurchase (not already purchased)
  → Check UserPoints.balance >= exam.price
  → Deduct points, create PointsTransaction
  → Create ExamPurchase record
  → Return {success, new_balance}
```

**AI Solution Generation Flow:**
```
User → POST /api/questions/<r_id>/questions/<q_id>/generate
  → Verify authenticated & question unlocked
  → Check balance >= 5 points
  → Deduct 5 points
  → Call Gemini API (or fallback)
  → Return temporary solution
```

**Stripe Payment Flow:**
```
Frontend → Stripe Checkout Session
  → User completes payment
  → Stripe sends webhook: checkout.session.completed
  → Backend receives event, verifies signature
  → Extracts {user_id, points, plan} from session metadata
  → Credits points via add_points()
  → Returns 200 OK to Stripe