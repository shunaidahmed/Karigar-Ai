# PROJECT_OVERVIEW.md

## Karigar.ai — AI Service Orchestrator for Pakistan's Informal Economy

### Quick Facts
| Field | Value |
|---|---|
| **App Name** | Karigar.ai |
| **Tagline** | Har Karigar, Ek Click Dur |
| **Type** | Progressive Web Application (PWA) |
| **Hackathon** | AI Seekho 2026 — Challenge 2 |
| **Framework** | Next.js 16 (App Router) |
| **Styling** | Tailwind CSS 4 |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **AI Engine** | DeepSeek API (deepseek-chat) |
| **Deployment** | Google Cloud Run |
| **Target Users** | Service seekers across Pakistan |
| **Developer** | Shunaid Ahmed |

---

### What is Karigar.ai?

Karigar.ai is a fully agentic AI-powered platform that automates the complete lifecycle of hiring a local service worker in Pakistan. From a casual Urdu voice message to a confirmed booking with tracking, feedback, and dispute resolution — everything is handled by seven specialized AI agents.

### The Problem

Pakistan's informal service economy employs millions — plumbers, electricians, AC technicians, tutors, mechanics. Finding and hiring a reliable worker is chaotic:

1. **Discovery is broken** — People rely on WhatsApp forwards and word of mouth
2. **Trust is missing** — No rating system, no accountability
3. **Pricing is unfair** — No standard prices, users overpay, workers underearn

### The Solution

```
User describes what they need (text or voice, any language)
        ↓
Agent 1: Understands the request (Urdu, Roman Urdu, English)
        ↓
Agent 2: Finds and ranks the best providers (10-factor scoring)
        ↓
Agent 3: Checks availability and confirms a time slot
        ↓
Agent 4: Calculates a fair transparent price
        ↓
Agent 5: Confirms booking and simulates lifecycle (13 steps)
        ↓
Agent 6: Collects feedback and updates provider reputation
        ↓
Agent 7: Handles any complaints or disputes
```

### Key Features

- **7 AI Agents** — Each handles a specific part of the booking lifecycle
- **250 Demo Providers** — Across 5 cities and 5 service categories
- **Multilingual** — English, Roman Urdu, Urdu script
- **Voice Input** — Web Speech API for Urdu voice commands
- **PWA** — Installable, works offline for non-AI features
- **Real-time Booking Tracker** — 13-step animated timeline
- **Dynamic Pricing** — Transparent price breakdown with budget alternatives
- **Dispute Resolution** — AI-powered fair assessment with compensation
- **Agent Trace Panel** — Full transparency into every AI decision
- **Responsive Design** — Mobile bottom nav, desktop sidebar
- **3D Animations** — Modern fintech-inspired UI with floating effects

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Lucide React icons |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password) |
| AI | DeepSeek API (deepseek-chat) |
| PWA | Service Worker, Web App Manifest |
| Deployment | Google Cloud Run (Docker) |
| CI/CD | Google Cloud Build |

### Project Structure

```
karigar-ai/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home (auth + onboarding)
│   │   ├── layout.tsx          # Root layout with nav
│   │   ├── globals.css         # Global styles + animations
│   │   ├── book/               # Booking flow (4-step wizard)
│   │   ├── bookings/           # Bookings list + detail
│   │   ├── disputes/           # Dispute resolution
│   │   ├── profile/            # User profile + settings
│   │   └── api/                # API routes (seed, demo-user)
│   ├── components/
│   │   ├── auth/               # Auth forms, provider, onboarding
│   │   ├── agents/             # Agent trace panel
│   │   ├── layout/             # Bottom nav, desktop nav
│   │   └── pwa/                # Service worker registration
│   ├── lib/
│   │   ├── agents/             # 7 AI agent implementations
│   │   ├── supabase/           # Supabase client/server/admin
│   │   └── translations.ts     # Multilingual translations
│   └── types/
│       └── database.ts         # TypeScript database types
├── public/                     # Static assets (icons, manifest, sw.js)
├── Dockerfile                  # Multi-stage Docker build
├── cloudbuild.yaml             # Google Cloud Build config
├── supabase-schema.sql         # Database schema + RLS policies
├── supabase-migration.sql      # Migration for onboarding column
├── next.config.ts              # Next.js config (standalone output)
├── package.json                # Dependencies
└── Karigar-Ai.md               # Full system design document
```

### Deployment

- **URL**: https://karigar-ai-472322773961.us-central1.run.app
- **Project ID**: karigar-ai-496816
- **Region**: us-central1
- **Resources**: 2 CPU, 1Gi Memory, 1 min instance, 5 max instances

### Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server) |
| `DEEPSEEK_API_KEY` | DeepSeek API key for AI agents |

### Authentication Flow

1. User visits app → sees login/signup screen
2. After login → onboarding modal appears (first time only)
3. Onboarding: city selection → services overview → tracking → ratings
4. After onboarding → full app access
5. All feature pages protected with `<ProtectedRoute>`

### Booking Flow

1. **Search** — Text or voice input, AI parses request
2. **Provider Selection** — Top 3 ranked providers with match scores
3. **Scheduling** — Time slot selection with conflict detection
4. **Pricing** — Transparent price breakdown with budget alternative
5. **Confirmation** — Booking created, 13-step tracker begins

### Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles, preferences, onboarding status |
| `providers` | Service provider data (250 demo records) |
| `bookings` | Booking records with status tracking |
| `disputes` | Dispute records with resolution data |
| `agent_traces` | AI agent decision logs for transparency |

All tables have Row Level Security (RLS) policies enabled.

---

*Built for AI Seekho 2026 — Har Karigar, Ek Click Dur*
