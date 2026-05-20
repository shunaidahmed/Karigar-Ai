# ARCHITECTURE.md

## Karigar.ai — System Architecture

---

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Next.js 16  │  │  Tailwind 4 │  │  React 19 Components    │ │
│  │  App Router  │  │  CSS        │  │  (Client + Server)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Service    │  │  Web App    │  │  Web Speech API         │ │
│  │  Worker     │  │  Manifest   │  │  (Voice Input)          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└───────────┬─────────────────────────────────────────────────────┘
            │ HTTPS
            │
┌───────────▼─────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD RUN                             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Next.js Standalone Server (Node.js 20)                   │  │
│  │  PORT: 8080 | CPU: 2 | Memory: 1Gi                        │  │
│  │  Min: 1 instance | Max: 5 instances                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  AI Agents (DeepSeek API)                                 │  │
│  │  Agent 1: Language Understanding                          │  │
│  │  Agent 2: Provider Matching                               │  │
│  │  Agent 3: Scheduling                                      │  │
│  │  Agent 4: Dynamic Pricing                                 │  │
│  │  Agent 5: Booking Simulation                              │  │
│  │  Agent 6: Quality Loop                                    │  │
│  │  Agent 7: Dispute Resolution                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ├──► Supabase (PostgreSQL)
            │    ├── Auth (email/password)
            │    ├── Database (5 tables with RLS)
            │    └── Real-time subscriptions
            │
            └──► DeepSeek API (deepseek-chat)
                 └── AI reasoning for all 7 agents
```

---

### Component Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (AuthProvider + Nav)
│   ├── page.tsx                  # Home (auth gate + onboarding)
│   ├── globals.css               # Animations + global styles
│   │
│   ├── book/page.tsx             # 4-step booking wizard
│   │   ├── Step 1: Search (text/voice)
│   │   ├── Step 2: Provider selection (ranked cards)
│   │   ├── Step 3: Scheduling (time slots)
│   │   └── Step 4: Pricing (breakdown + confirm)
│   │
│   ├── bookings/page.tsx         # Bookings list
│   ├── bookings/[id]/page.tsx    # Booking detail (13-step timeline)
│   ├── disputes/page.tsx         # Dispute center
│   ├── profile/page.tsx          # User settings
│   │
│   └── api/
│       ├── seed/route.ts         # Seed 250 providers
│       └── demo-user/route.ts    # Create demo account
│
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx      # Auth context + ProtectedRoute
│   │   ├── AuthForms.tsx         # Login + Signup forms
│   │   └── OnboardingModal.tsx   # 4-step onboarding
│   │
│   ├── agents/
│   │   └── AgentTracePanel.tsx   # Collapsible agent log drawer
│   │
│   ├── layout/
│   │   ├── BottomNav.tsx         # Mobile bottom navigation
│   │   └── DesktopNav.tsx        # Desktop sidebar
│   │
│   └── pwa/
│       └── ServiceWorkerRegistration.tsx
│
├── lib/
│   ├── agents/
│   │   ├── agent1-language.ts    # Language understanding
│   │   ├── agent2-matching.ts    # Provider matching
│   │   ├── agent3-scheduling.ts  # Scheduling engine
│   │   ├── agent4-pricing.ts     # Dynamic pricing
│   │   ├── agent6-quality.ts     # Quality loop
│   │   └── agent7-dispute.ts     # Dispute resolution
│   │
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   ├── admin.ts              # Admin client (service role)
│   │   └── middleware.ts         # Auth middleware
│   │
│   └── translations.ts           # i18n (en, ur-rom, ur)
│
└── types/
    └── database.ts               # TypeScript types for Supabase
```

---

### Data Flow

#### Booking Flow
```
User Input (text/voice)
    │
    ▼
Agent 1: Parse → ParsedRequest
    │
    ▼
Agent 2: Match → RankedProvider[]
    │ User selects
    ▼
Agent 3: Schedule → ConfirmedSlot
    │
    ▼
Agent 4: Price → PriceBreakdown
    │ User confirms
    ▼
Supabase: Create booking record
    │
    ▼
Booking Detail: 13-step simulation
    │
    ▼
Agent 6: Feedback → Updated rating
    │ (optional)
    ▼
Agent 7: Dispute → Resolution
```

#### Authentication Flow
```
Page Load
    │
    ▼
AuthProvider: Check session
    │
    ├── No session → Show login/signup
    │
    └── Has session → Check onboarding_completed
        │
        ├── false → Show OnboardingModal
        │
        └── true → Render page content
```

---

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                         │
│                                                             │
│  1. Authentication                                          │
│     └── Supabase Auth (email/password + JWT)               │
│                                                             │
│  2. Authorization                                           │
│     └── Row Level Security (RLS) policies                  │
│     └── ProtectedRoute component                           │
│                                                             │
│  3. Data Validation                                         │
│     └── TypeScript strict mode                             │
│     └── Zod schemas (for API inputs)                       │
│                                                             │
│  4. API Security                                            │
│     └── Service role key only on server                    │
│     └── Anon key for client (restricted by RLS)            │
│     └── DeepSeek API key in env vars                       │
│                                                             │
│  5. Infrastructure                                          │
│     └── HTTPS only (Cloud Run)                             │
│     └── Docker image scanning                              │
│     └── IAM roles for service account                      │
└─────────────────────────────────────────────────────────────┘
```

---

### PWA Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PWA FEATURES                            │
│                                                             │
│  Service Worker (sw.js)                                     │
│  ├── Cache v2 (GET requests only)                          │
│  ├── Cache first for static assets                         │
│  ├── Network only for API calls                            │
│  └── Fallback to cached shell when offline                 │
│                                                             │
│  Web App Manifest (manifest.json)                           │
│  ├── App name, short name, description                     │
│  ├── Icons (192x192, 512x512)                              │
│  ├── Theme color (#059669)                                 │
│  └── Display: standalone                                   │
│                                                             │
│  Offline Capabilities                                       │
│  ├── View saved bookings                                   │
│  ├── View profile                                          │
│  └── Read agent trace logs                                 │
│                                                             │
│  Online Only                                                │
│  ├── All AI agent features                                 │
│  ├── New booking requests                                  │
│  └── Real-time provider updates                            │
└─────────────────────────────────────────────────────────────┘
```

---

### Deployment Pipeline

```
git push → GitHub
    │
    ▼
gcloud builds submit
    │
    ├── Build Docker image (multi-stage)
    │   ├── deps: npm install
    │   ├── builder: next build (with env args)
    │   └── runner: standalone server
    │
    └── Push to Artifact Registry
        │
        ▼
gcloud run deploy
    │
    ├── Create new revision
    ├── Set IAM policy
    ├── Route traffic (100% to new)
    └── Old revision scaled to 0
        │
        ▼
    Live at https://karigar-ai-472322773961.us-central1.run.app
```

---

*Last Updated: May 20, 2026*
