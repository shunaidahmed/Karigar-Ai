# TEAM_WALKTHROUGH.md

## Karigar.ai — Developer Walkthrough Guide

### For Team Members Joining This Project

---

### 1. Quick Start (5 minutes)

```bash
# Clone the repo
git clone https://github.com/shunaidahmed/Karigar-AI.git
cd Karigar-AI

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase and DeepSeek keys

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

---

### 2. Understanding the Architecture

#### High-Level Flow
```
Browser → Next.js App → Supabase (Auth + DB) → DeepSeek (AI Agents)
```

#### Key Directories
```
src/app/          → Pages and routes (Next.js App Router)
src/components/   → Reusable UI components
src/lib/agents/   → 7 AI agent implementations
src/lib/supabase/ → Database client configuration
src/types/        → TypeScript type definitions
```

#### Page Routing
```
/              → Home (auth gate + onboarding)
/book          → Booking wizard (protected)
/bookings      → Bookings list (protected)
/bookings/[id] → Booking detail (protected)
/disputes      → Dispute center (protected)
/profile       → User settings (protected)
/api/seed      → Seed 250 demo providers
/api/demo-user → Create demo user account
```

---

### 3. How the AI Agents Work

All agents are in `src/lib/agents/`. Each agent is a TypeScript function that:
1. Takes structured input
2. Calls DeepSeek API with a prompt
3. Parses JSON response
4. Returns typed output

#### Agent 1: Language Understanding (`agent1-language.ts`)
- **Input**: Raw user text (Urdu, Roman Urdu, English)
- **Output**: ParsedRequest with service type, location, severity, etc.
- **Fallback**: Keyword-based parsing if AI fails

#### Agent 2: Provider Matching (`agent2-matching.ts`)
- **Input**: ParsedRequest + list of providers
- **Output**: RankedProvider[] with match scores (0-100)
- **Algorithm**: 10-factor weighted scoring

#### Agent 3: Scheduling (`agent3-scheduling.ts`)
- **Input**: Provider booked slots + requested time
- **Output**: Confirmed slot or alternatives
- **Rules**: 30-min travel buffer, 07:00-21:00 working hours

#### Agent 4: Dynamic Pricing (`agent4-pricing.ts`)
- **Input**: Provider details, job complexity, urgency
- **Output**: Price breakdown with budget alternative
- **Formula**: Visit fee + distance + complexity + urgency ± discounts

#### Agent 5: Booking (simulated in booking detail page)
- **Input**: Booking confirmation
- **Output**: 13-step animated timeline

#### Agent 6: Quality Loop (`agent6-quality.ts`)
- **Input**: User rating + comment
- **Output**: Updated provider rating, sentiment analysis

#### Agent 7: Dispute Resolution (`agent7-dispute.ts`)
- **Input**: Dispute type, description, provider history
- **Output**: Resolution decision, compensation, escalation

---

### 4. Authentication Flow

```
User visits / → AuthProvider checks session
    │
    ├── Not logged in → Show login/signup form
    │
    └── Logged in → Check onboarding_completed
        │
        ├── false → Show OnboardingModal
        │
        └── true → Show home page
```

**ProtectedRoute** wraps all feature pages:
```tsx
export default function BookPage() {
  return (
    <ProtectedRoute>
      <BookContent />
    </ProtectedRoute>
  )
}
```

---

### 5. Database Operations

All database calls use Supabase client:

```typescript
// In a client component
const supabase = createClient() as any
const { data } = await supabase
  .from('bookings')
  .select('*, providers(name)')
  .eq('user_id', user.id)
```

**RLS Policies** ensure users can only access their own data:
- `profiles`: Users can only read/update their own profile
- `bookings`: Users can only see their own bookings
- `disputes`: Users can only see their own disputes

---

### 6. Adding a New Feature

#### Step 1: Create the page
```
src/app/new-feature/page.tsx
```

#### Step 2: Wrap with ProtectedRoute
```tsx
import { ProtectedRoute } from '@/components/auth/AuthProvider'

function NewFeatureContent() { /* ... */ }

export default function NewFeaturePage() {
  return (
    <ProtectedRoute>
      <NewFeatureContent />
    </ProtectedRoute>
  )
}
```

#### Step 3: Add to navigation
Edit `src/components/layout/BottomNav.tsx` and `DesktopNav.tsx`

#### Step 4: Add database table (if needed)
Add to `supabase-schema.sql` and create migration

---

### 7. Deployment Process

```bash
# 1. Build and push Docker image
gcloud builds submit \
  --config cloudbuild.yaml \
  --project karigar-ai-496816 \
  --substitutions _NEXT_PUBLIC_SUPABASE_URL=$URL,_NEXT_PUBLIC_SUPABASE_ANON_KEY=$KEY

# 2. Deploy to Cloud Run
gcloud run deploy karigar-ai \
  --image us-central1-docker.pkg.dev/karigar-ai-496816/containers/karigar-ai:latest \
  --region us-central1 \
  --project karigar-ai-496816 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=...,NEXT_PUBLIC_SUPABASE_ANON_KEY=...,SUPABASE_SERVICE_ROLE_KEY=...,DEEPSEEK_API_KEY=..."
```

---

### 8. Common Tasks

#### Add a new provider category
1. Edit `src/app/api/seed/route.ts` — add category to services array
2. Run `curl https://your-url/api/seed` to re-seed

#### Change the AI model
1. Edit `src/lib/agents/agent1-language.ts` (and other agents)
2. Change the `model` parameter in the DeepSeek API call

#### Update database schema
1. Edit `supabase-schema.sql`
2. Run SQL in Supabase Dashboard → SQL Editor
3. Update `src/types/database.ts`

#### Add a new animation
1. Edit `src/app/globals.css` — add @keyframes and utility class
2. Use the class in any component

---

### 9. Troubleshooting

| Issue | Solution |
|---|---|
| Page stuck loading | Check browser console for errors, verify Supabase keys |
| Auth not working | Check `.env.local` has correct Supabase URL and anon key |
| AI agents failing | Verify `DEEPSEEK_API_KEY` is valid |
| Build fails | Run `npm run build` locally to see TypeScript errors |
| Cloud Run 503 | Check logs: `gcloud logging read "resource.type=cloud_run_revision"` |
| Service worker error | Clear browser cache, service worker caches are versioned |

---

### 10. Code Conventions

- **Components**: PascalCase, `'use client'` for client components
- **Functions**: camelCase, async/await for async operations
- **Types**: PascalCase, defined in `src/types/`
- **CSS**: Tailwind utility classes, custom animations in `globals.css`
- **Imports**: Aliased with `@/` (e.g., `@/components/auth/AuthProvider`)
- **Error handling**: Try/catch with user-friendly messages

---

*For questions, check Karigar-Ai.md for the full system design document.*
