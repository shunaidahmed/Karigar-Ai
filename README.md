# Karigar.ai — Har Karigar, Ek Click Dur

> AI Service Orchestrator for Pakistan's Informal Economy

**AI Seekho 2026 Hackathon** — Challenge 2: AI Service Orchestrator for Informal Economy

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)
[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek-101010)](https://www.deepseek.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8)](https://web.dev/progressive-web-apps/)

---

## Overview

Karigar.ai is a full-stack Progressive Web Application that automates the complete lifecycle of hiring a local service worker in Pakistan. From a casual Urdu voice message to a confirmed booking with tracking, feedback, and dispute resolution — everything is handled by **seven specialized AI agents** orchestrated through DeepSeek AI.

**Tagline:** Har Karigar, Ek Click Dur (Every Artisan, One Click Away)

---

## The Problem

Pakistan's informal service economy employs millions of workers — plumbers, electricians, AC technicians, tutors, beauticians, drivers, and mechanics. Despite this massive workforce, finding and hiring a reliable service worker remains broken:

- **Discovery is broken** — People rely on WhatsApp forwards, neighborhood Facebook groups, and word of mouth
- **Trust is missing** — No rating system, no accountability, no way to verify skills before hiring
- **Pricing is unfair** — No standard prices. Users overpay out of ignorance, workers underearn due to no market visibility

---

## The Solution

Karigar.ai replaces the entire informal hiring process with a **7-agent AI workflow**:

```
User describes what they need (any language, any spelling)
        ↓
Agent 1: AI understands the request
        ↓
Agent 2: AI finds and ranks the best providers (250+ across 5 cities)
        ↓
Agent 3: AI checks availability and confirms a slot
        ↓
Agent 4: AI calculates a fair transparent price
        ↓
Agent 5: AI confirms the booking and sends notifications
        ↓
Agent 6: AI tracks the job and collects feedback
        ↓
Agent 7: AI handles any complaints or disputes
```

Every step is visible. Every decision is logged. The user is never left wondering what's happening.

---

## Features

### 7 AI Agents

| Agent | Name | Function |
|---|---|---|
| **Agent 1** | Language Understanding | Parses Urdu, Roman Urdu, English, mixed language requests with confidence scoring |
| **Agent 2** | Provider Matching | 10-factor weighted scoring algorithm across 250+ providers |
| **Agent 3** | Scheduling Intelligence | Conflict detection, travel buffers, alternative slot suggestions |
| **Agent 4** | Dynamic Pricing | Transparent pricing with complexity, urgency, surge, and loyalty factors |
| **Agent 5** | Booking Simulation | 13-step animated booking lifecycle tracker |
| **Agent 6** | Service Quality Loop | Feedback analysis, weighted rating updates, reputation management |
| **Agent 7** | Dispute Resolution | Fair assessment with escalation rules and compensation logic |

### Core Features

- **Multilingual Support** — English, Roman Urdu, Urdu script (RTL)
- **Voice Search** — Web Speech API for Urdu and English voice input
- **Real-time AI** — DeepSeek API for all reasoning tasks
- **250+ Service Providers** — 50 per category across 5 cities (Islamabad, Karachi, Lahore, Peshawar, Multan)
- **5 Service Categories** — AC Repair, Electrician, Plumber, Home Tutor, Mechanic
- **PWA Ready** — Installable, offline-capable, service worker caching
- **Responsive Design** — Desktop sidebar + mobile bottom navigation
- **Supabase Auth** — Email/password authentication with profile management
- **Row Level Security** — Full database security policies
- **Agent Trace Panel** — Slide-in drawer showing all AI reasoning chains with export

### Screens

| Screen | Description |
|---|---|
| **Home** | Search bar, voice input, trending services, recent bookings |
| **Booking Flow** | 5-step wizard: Search → Provider → Schedule → Price → Confirm |
| **Bookings List** | Grid view of all bookings with status badges |
| **Booking Detail** | Animated 13-step timeline, feedback form, report problem |
| **Disputes** | File disputes, view resolutions, escalation tracking |
| **Profile** | User info, language preference, logout, developer credits |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **AI Engine** | DeepSeek API (deepseek-chat) |
| **Voice** | Web Speech API |
| **PWA** | Service Worker + Web App Manifest |
| **Deployment** | Vercel |

---

## Project Structure

```
karigar-ai/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with responsive nav
│   │   ├── page.tsx                # Home: search, trending, recent bookings
│   │   ├── globals.css             # Tailwind + custom animations
│   │   ├── book/page.tsx           # 5-step booking wizard
│   │   ├── bookings/page.tsx       # Bookings list
│   │   ├── bookings/[id]/page.tsx  # Booking detail + timeline + feedback
│   │   ├── disputes/page.tsx       # Dispute center (Agent 7)
│   │   ├── profile/page.tsx        # User profile + language settings
│   │   └── api/
│   │       ├── seed/route.ts       # 250 provider seed data generator
│   │       └── demo-user/route.ts  # Demo user creation endpoint
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx    # Supabase auth context
│   │   │   └── AuthForms.tsx       # Login/Signup forms
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx       # Mobile bottom navigation (5 tabs)
│   │   │   └── DesktopNav.tsx      # Desktop sidebar navigation
│   │   ├── agents/
│   │   │   └── AgentTracePanel.tsx # Slide-in trace drawer with export
│   │   └── pwa/
│   │       └── ServiceWorkerRegistration.tsx  # PWA registration + credits
│   ├── lib/
│   │   ├── agents/
│   │   │   ├── agent1-language.ts  # Language understanding (DeepSeek + fallback)
│   │   │   ├── agent2-matching.ts  # Provider matching (10-factor scoring)
│   │   │   ├── agent3-scheduling.ts # Scheduling with conflict detection
│   │   │   ├── agent4-pricing.ts   # Dynamic pricing formula
│   │   │   ├── agent6-quality.ts   # Service quality + rating update
│   │   │   └── agent7-dispute.ts   # Dispute resolution with escalation
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   ├── server.ts           # Server Supabase client
│   │   │   ├── admin.ts            # Admin client (service role)
│   │   │   └── middleware.ts       # Auth session middleware
│   │   └── translations.ts         # EN / Roman Urdu / Urdu translations
│   ├── types/
│   │   └── database.ts             # Full Supabase TypeScript types
│   └── middleware.ts               # Supabase session middleware
├── public/
│   ├── manifest.json               # PWA manifest
│   └── sw.js                       # Service worker (offline caching)
├── supabase-schema.sql             # Full DB schema with RLS policies
├── .env.local.example              # Environment variables template
├── next.config.ts                  # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project
- A [DeepSeek](https://platform.deepseek.com) API key

### 1. Clone the Repository

```bash
git clone https://github.com/shunaidahmed/Karigar-AI.git
cd Karigar-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of `supabase-schema.sql`
3. Copy your project URL and anon key from **Settings → API**

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 5. Seed the Database

```bash
npm run dev
```

Then visit: `http://localhost:3000/api/seed`

This creates **250 service providers** (50 per category across 5 cities).

### 6. Create Demo User

Visit: `http://localhost:3000/api/demo-user`

Or sign up manually with:
- **Email:** `demo@karigar.ai`
- **Password:** `demo1234`

### 7. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

### Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles (extends Supabase auth.users) |
| `providers` | 250 service providers with ratings, skills, availability |
| `bookings` | Booking lifecycle with status machine |
| `disputes` | Dispute records with resolution details |
| `agent_traces` | AI agent reasoning logs for transparency |

### Row Level Security

All tables have RLS policies enabled. Users can only access their own data. Providers are publicly readable.

---

## Matching Algorithm

Agent 2 uses a weighted 10-factor scoring system:

| Factor | Weight | Description |
|---|---|---|
| Skill Match | 20% | Exact specialization vs general vs adjacent |
| Overall Rating | 20% | Provider's star rating (1-5) |
| On-Time Score | 15% | Historical punctuality percentage |
| Review Sentiment | 10% | Recent review sentiment + recency |
| Cancellation Rate | 10% | Inverted (lower is better) |
| Location Bonus | 10% | +10 points for providers in requested city |
| Risk Score | 5% | Inverted (low risk = high score) |
| Price Competitiveness | 5% | Relative to cheapest available |
| Capacity Availability | 3% | Remaining slots vs max capacity |
| Certifications | 2% | Has relevant certifications |

**Tiebreaker:** Higher on-time score wins.

---

## Dynamic Pricing Model

```
Final Price = Visit Fee
            + Labor (Hourly Rate × Hours)
            + Distance Charge (KM × Rate per KM)
            + Complexity Multiplier (1.0x / 1.4x / 1.8x)
            + Urgency Surcharge (PKR 0 / 300 / 600)
            + Time of Day Adjustment (10% evening premium)
            - Loyalty Discount (5% for returning users)
            + Demand Surge (up to 20%)

Platform Fee: 10% of total (shown separately)
Provider Earning: Total minus Platform Fee
```

---

## Booking Lifecycle

```
[REQUESTED] → [UNDERSTOOD] → [PROVIDER_SELECTED] → [SLOT_CONFIRMED]
     → [PRICE_APPROVED] → [BOOKING_CONFIRMED] → [IN_PROGRESS]
     → [COMPLETED] → [CLOSED]
     OR [DISPUTED] → [RESOLVED]
```

Each state is persisted in Supabase. Users can track progress via the animated timeline.

---

## Dispute Resolution Rules

| Rule | Condition | Action |
|---|---|---|
| Warning Flag | 3+ disputes in 30 days | Provider flagged |
| Suspension | 5+ total disputes | Provider suspended |
| Human Escalation | Refund > PKR 5,000 | Escalate to human review |
| Auto Rebooking | Provider no-show | Offer next ranked provider |
| Price Comparison | Price dispute | Compare quoted vs charged |

---

## PWA Features

- **Installable** — Add to home screen on mobile
- **Offline Support** — View past bookings, provider profiles, agent traces
- **Service Worker** — Cache-first for static assets, network-first for API calls
- **Theme Color** — Emerald green (#059669)

---

## Deployment

### Vercel (Recommended)

```bash
npx vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPSEEK_API_KEY`

### Manual Deploy

```bash
npm run build
npm start
```

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/seed` | GET | Seed 250 providers into database |
| `/api/demo-user` | GET | Create demo user account |

---

## Credits

**Developed by [Shunaid Ahmed](https://github.com/shunaidahmed)**

Built for **AI Seekho 2026** — Digital Inclusion Challenge

---

## License

This project is built for the AI Seekho 2026 Hackathon. See the [LICENSE](LICENSE) file for details.

---

*Har Karigar, Ek Click Dur*
