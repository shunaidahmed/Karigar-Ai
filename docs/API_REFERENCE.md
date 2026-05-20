# API_REFERENCE.md

## Karigar.ai — API & Agent Reference

---

### AI Agents

#### Agent 1: Language Understanding

**File**: `src/lib/agents/agent1-language.ts`

**Function**: `agent1LanguageUnderstanding(input: string): Promise<ParsedRequest>`

**Input**: Raw user text in any language (Urdu, Roman Urdu, English, mixed)

**Output**:
```typescript
interface ParsedRequest {
  serviceType: string          // e.g., "AC Repair", "Electrician"
  issueDescription: string     // Detailed description
  severity: 'low' | 'medium' | 'high'
  location: string             // e.g., "G-13", "Islamabad"
  preferredDate: string
  preferredTimeWindow: string
  isoTimeFrom: string
  isoTimeTo: string
  priceSensitivity: 'low' | 'medium' | 'high'
  detectedLanguage: string
  confidenceScore: number      // 0-100
  clarificationNeeded: boolean
  clarificationQuestion: string
}
```

**Fallback**: Keyword-based parsing if DeepSeek API fails

---

#### Agent 2: Provider Matching

**File**: `src/lib/agents/agent2-matching.ts`

**Function**: `agent2ProviderMatching(request: ParsedRequest, providers: Provider[]): MatchingResult`

**Input**: ParsedRequest + full provider list

**Output**:
```typescript
interface MatchingResult {
  jobComplexity: 'basic' | 'intermediate' | 'complex'
  totalProvidersEvaluated: number
  rankedProviders: RankedProvider[]
}

interface RankedProvider {
  providerId: string
  name: string
  matchScore: number           // 0-100
  rankingRationale: string
  whyNotFirst: string
  estimatedArrival: string
  riskFlag: boolean
  riskReason: string
  provider: Provider           // Full provider object
}
```

**Scoring Factors** (weighted):
| Factor | Weight |
|---|---|
| Skill match | 20% |
| Rating | 20% |
| On-time score | 15% |
| Review recency/sentiment | 10% |
| Cancellation rate (inverted) | 10% |
| Distance | 10% |
| Risk score (inverted) | 5% |
| Price competitiveness | 5% |
| Capacity availability | 3% |
| Certifications | 2% |

---

#### Agent 3: Scheduling

**File**: `src/lib/agents/agent3-scheduling.ts`

**Function**: `agent3Scheduling(bookedSlots: string[], from: string, to: string): SchedulingResult`

**Input**: Provider's booked slots + requested time window

**Output**:
```typescript
interface SchedulingResult {
  status: 'confirmed' | 'conflict' | 'cancelled'
  confirmedSlot: string
  conflictReason: string
  alternativeSlots: string[]
  waitlistAvailable: boolean
  waitlistPosition: number
  nextAvailableTime: string
}
```

**Rules**:
- 30-minute travel buffer between jobs
- Working hours: 07:00-21:00
- Always suggest alternatives on conflict

---

#### Agent 4: Dynamic Pricing

**File**: `src/lib/agents/agent4-pricing.ts`

**Function**: `agent4DynamicPricing(provider, complexity, priceSensitivity, time, loyalty, demand): PricingResult`

**Output**:
```typescript
interface PricingResult {
  totalEstimatedPKR: number
  breakdown: { label: string; amountPKR: number }[]
  providerEarningPKR: number
  platformFeePKR: number
  budgetAlternative: { description: string; savingPKR: number; tradeoff: string }
  fairnessSummaryUser: string
  fairnessSummaryProvider: string
  surgeApplied: boolean
  surgeReason: string
}
```

**Pricing Formula**:
```
Total = Visit Fee + (Distance × Rate/km) + (Complexity × Base Rate)
      + Urgency Surcharge + Time Adjustment - Loyalty Discount + Demand Surge
```

---

#### Agent 5: Booking Simulation

**Location**: `src/app/bookings/[id]/page.tsx`

Simulates a 13-step booking lifecycle with animated delays:

| Step | Description |
|---|---|
| 1 | Booking Created |
| 2 | Provider Notified |
| 3 | Provider Accepted |
| 4 | Calendar Updated |
| 5 | Confirmation Sent |
| 6 | Reminder Scheduled |
| 7 | Reminder Fired |
| 8 | Provider En Route |
| 9 | Provider Arrived |
| 10 | Job Started |
| 11 | Job Completed |
| 12 | Invoice Generated |
| 13 | Feedback Requested |

---

#### Agent 6: Quality Loop

**File**: `src/lib/agents/agent6-quality.ts`

**Function**: `agent6QualityAnalysis(provider, rating, comment, booking): QualityResult`

**Output**:
```typescript
interface QualityResult {
  sentimentScore: number       // -1 to 1
  sentimentLabel: 'positive' | 'neutral' | 'negative'
  updatedRating: number
  matchingPriorityChange: 'increase' | 'unchanged' | 'decrease'
  changeReason: string
  flagForReview: boolean
  flagReason: string
  thankYouMessageUrdu: string
  thankYouMessageEnglish: string
}
```

**Rating Update**: `New = (Existing × 0.80) + (New × 0.20)`

---

#### Agent 7: Dispute Resolution

**File**: `src/lib/agents/agent7-dispute.ts`

**Function**: `agent7DisputeResolution(type, description, providerHistory, price): DisputeResult`

**Output**:
```typescript
interface DisputeResult {
  disputeSeverity: 'low' | 'medium' | 'high'
  likelyFault: 'user' | 'provider' | 'unclear'
  recommendedAction: 'refund' | 'partial_refund' | 'rebook' | 'warning' | 'suspend' | 'escalate'
  compensationPKR: number
  compensationReason: string
  messageToUser: string
  messageToProvider: string
  escalateToHuman: boolean
  escalationReason: string
  providerPenaltyApplied: boolean
  penaltyDetails: string
}
```

**Escalation Rules**:
- 3+ disputes in 30 days → warning flag
- 5+ disputes → temporary suspension
- Refund > PKR 5,000 → human review
- No-show → auto rebooking offer

---

### API Routes

#### POST /api/seed

Seeds 250 demo providers across 5 cities and 5 service categories.

**Response**: `{ message: "Seeded 250 providers", count: 250 }`

#### POST /api/demo-user

Creates a demo user account for testing.

**Response**: `{ email, password, userId }`

---

### Supabase Tables

| Table | Columns | RLS |
|---|---|---|
| `profiles` | id, full_name, phone, city, area, loyalty_status, language_preference, onboarding_completed | User can only access own |
| `providers` | id, name, phone, skill, city, rating, visit_fee, hourly_rate_pkr, ... | Public read |
| `bookings` | id, user_id, provider_id, service_type, status, total_price_pkr, ... | User can only access own |
| `disputes` | id, booking_id, user_id, provider_id, dispute_type, status, compensation_pkr, ... | User can only access own |
| `agent_traces` | id, booking_id, agent_id, agent_name, decision, rationale, confidence_score, ... | User can only access own |

---

*Last Updated: May 20, 2026*
