# IMPLEMENTATION_PLAN.md

## Karigar.ai — Implementation Plan

### Phase 1: Project Setup (Completed)
- [x] Initialize Next.js 16 project with App Router
- [x] Configure Tailwind CSS 4
- [x] Set up TypeScript strict mode
- [x] Configure Supabase client (browser, server, admin)
- [x] Set up Supabase project and database
- [x] Create database schema with RLS policies
- [x] Configure environment variables
- [x] Set up Docker multi-stage build
- [x] Configure Google Cloud Build pipeline
- [x] Deploy to Google Cloud Run

### Phase 2: Core Infrastructure (Completed)
- [x] Implement Supabase auth (email/password)
- [x] Create AuthProvider with session management
- [x] Build AuthForms (login/signup)
- [x] Create ProtectedRoute component
- [x] Set up responsive navigation (mobile + desktop)
- [x] Configure PWA (manifest, service worker, icons)
- [x] Create seed route for 250 demo providers
- [x] Implement multilingual support (en, ur-rom, ur)

### Phase 3: AI Agents (Completed)
- [x] Agent 1: Language Understanding — Parses natural language requests
- [x] Agent 2: Provider Matching — 10-factor weighted scoring algorithm
- [x] Agent 3: Scheduling — Conflict detection, alternative slots
- [x] Agent 4: Dynamic Pricing — Transparent price breakdown
- [x] Agent 5: Booking — 13-step lifecycle simulation
- [x] Agent 6: Quality Loop — Feedback analysis, rating updates
- [x] Agent 7: Dispute Resolution — Fair assessment, compensation

### Phase 4: UI Screens (Completed)
- [x] Home page with auth gating
- [x] Onboarding modal (4-step tutorial)
- [x] Booking flow (4-step wizard: search → providers → schedule → price)
- [x] Bookings list page
- [x] Booking detail page (13-step timeline)
- [x] Disputes page (list + new form + resolution)
- [x] Profile page (settings, language, logout)
- [x] Agent trace panel (collapsible drawer)

### Phase 5: Animations & Polish (Completed)
- [x] CSS animation library (float, shimmer, gradient, slide, scale, bounce, glow, ripple)
- [x] 3D card hover effects
- [x] Staggered animation delays
- [x] Skeleton loading states
- [x] Notification toasts
- [x] Interactive hover states
- [x] Gradient animated headers

### Phase 6: Security & Auth (Completed)
- [x] ProtectedRoute wrapper on all feature pages
- [x] Auth check on home page (redirect to login if not authenticated)
- [x] Onboarding modal after first login
- [x] onboarding_completed column in profiles table
- [x] Service worker POST request fix
- [x] Auth loading state improvements

### Phase 7: Deployment Optimization (Completed)
- [x] Docker build args for NEXT_PUBLIC env vars
- [x] Cloud Build configuration with substitutions
- [x] Cloud Run resource scaling (2 CPU, 1Gi RAM)
- [x] Min instances set to 1 (no cold starts)
- [x] PORT set to 8080 for Cloud Run compatibility

---

### Architecture Decisions

| Decision | Rationale |
|---|---|
| Next.js 16 over vanilla JS | SSR, routing, ecosystem, production-ready |
| Supabase over Firebase | PostgreSQL, RLS, better TypeScript support |
| DeepSeek over Gemini | Cost-effective, fast, reliable JSON output |
| Cloud Run over Vercel | Docker support, custom scaling, GCP integration |
| Client-side auth over middleware | Simpler, no SSR auth complexity |
| ProtectedRoute wrapper | Consistent auth protection across all pages |

### Agent Communication Flow

```
User Input
    │
    ▼
┌─────────────────┐
│  Agent 1        │  Language Understanding
│  (parse input)  │  → Structured request JSON
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Agent 2        │  Provider Matching
│  (rank providers)│  → Top 3 with scores
└────────┬────────┘
         │ User selects
         ▼
┌─────────────────┐
│  Agent 3        │  Scheduling
│  (check slots)  │  → Confirmed or alternatives
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Agent 4        │  Dynamic Pricing
│  (calculate)    │  → Price breakdown
└────────┬────────┘
         │ User confirms
         ▼
┌─────────────────┐
│  Agent 5        │  Booking Simulation
│  (13 steps)     │  → Full lifecycle
└────────┬────────┘
         │ Job complete
         ▼
┌─────────────────┐
│  Agent 6        │  Quality Loop
│  (feedback)     │  → Updated ratings
└────────┬────────┘
         │ Dispute filed
         ▼
┌─────────────────┐
│  Agent 7        │  Dispute Resolution
│  (assess)       │  → Resolution decision
└─────────────────┘
```

### Database Schema Summary

```sql
profiles (
  id uuid PK,              -- Links to auth.users
  full_name text,
  phone text,
  city text,
  area text,
  loyalty_status text,     -- 'new' or 'returning'
  language_preference text, -- 'en', 'ur-rom', 'ur'
  onboarding_completed bool,
  created_at timestamptz,
  updated_at timestamptz
)

providers (
  id text PK,
  name text, phone text, skill text,
  specializations text[], certifications text[],
  city text, areas text[], lat numeric, lng numeric,
  rating numeric, total_reviews integer,
  on_time_score integer, cancellation_rate integer,
  risk_score text, dispute_count integer,
  visit_fee integer, hourly_rate_pkr integer,
  rate_per_km integer, loyalty_discount integer,
  available boolean, booked_slots timestamptz[],
  max_daily_capacity integer, years_experience integer,
  tier text
)

bookings (
  id uuid PK,
  user_id uuid FK → profiles,
  provider_id text FK → providers,
  service_type text,
  issue_description text,
  severity text,
  location text,
  status text,
  total_price_pkr integer,
  price_breakdown jsonb,
  provider_earning_pkr integer,
  platform_fee_pkr integer,
  surge_applied boolean,
  preferred_time_window text,
  feedback_rating integer,
  feedback_comment text,
  created_at timestamptz
)

disputes (
  id uuid PK,
  booking_id uuid FK → bookings,
  user_id uuid FK → profiles,
  provider_id text FK → providers,
  dispute_type text,
  user_description text,
  dispute_severity text,
  likely_fault text,
  recommended_action text,
  compensation_pkr integer,
  status text,
  created_at timestamptz
)

agent_traces (
  id uuid PK,
  booking_id uuid FK → bookings,
  agent_id text,
  agent_name text,
  input_summary text,
  decision text,
  rationale text,
  output_summary text,
  confidence_score integer,
  processing_time_ms integer,
  created_at timestamptz
)
```

---

*Last Updated: May 20, 2026*
