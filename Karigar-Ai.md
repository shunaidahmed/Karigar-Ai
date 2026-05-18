# Karigar.ai — Full System Design Document
### AI Service Orchestrator for Pakistan's Informal Economy
### AI Seekho 2026 Hackathon Submission

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution Summary](#3-solution-summary)
4. [PWA Architecture](#4-pwa-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Application Structure](#6-application-structure)
7. [The 7 Agent System](#7-the-7-agent-system)
8. [Provider Dataset Schema](#8-provider-dataset-schema)
9. [Matching Algorithm](#9-matching-algorithm)
10. [Dynamic Pricing Model](#10-dynamic-pricing-model)
11. [Scheduling Engine](#11-scheduling-engine)
12. [Multilingual System](#12-multilingual-system)
13. [Booking Lifecycle](#13-booking-lifecycle)
14. [Dispute Resolution Workflow](#14-dispute-resolution-workflow)
15. [Agent Trace and Logging System](#15-agent-trace-and-logging-system)
16. [Screen by Screen UI Plan](#16-screen-by-screen-ui-plan)
17. [Data Flow Diagrams](#17-data-flow-diagrams)
18. [APIs and Integrations](#18-apis-and-integrations)
19. [Edge Cases and Fallbacks](#19-edge-cases-and-fallbacks)
20. [PWA Offline Strategy](#20-pwa-offline-strategy)
21. [Security and Privacy](#21-security-and-privacy)
22. [Performance Plan](#22-performance-plan)
23. [Deployment Plan](#23-deployment-plan)
24. [Testing Plan](#24-testing-plan)
25. [Known Limitations](#25-known-limitations)
26. [Future Roadmap](#26-future-roadmap)

---

## 1. Project Overview

**App Name:** Karigar.ai
**Tagline:** Har Karigar, Ek Click Dur
**Type:** Progressive Web Application (PWA)
**Target Users:** Service seekers and informal economy workers across Pakistan
**Built With:** Google Antigravity, Gemini API, Vanilla JavaScript, HTML, CSS
**Hackathon:** AI Seekho 2026 — Challenge 2: AI Service Orchestrator for Informal Economy

Karigar.ai is a fully agentic AI powered platform that automates the complete lifecycle of hiring a local service worker in Pakistan. From a casual Urdu voice message to a confirmed booking with tracking, feedback, and dispute resolution — everything is handled by seven specialized AI agents orchestrated through Google Antigravity.

---

## 2. Problem Statement

Pakistan's informal service economy employs millions of workers including plumbers, electricians, AC technicians, tutors, beauticians, drivers, and mechanics. Despite this massive workforce, finding and hiring a reliable service worker remains chaotic and broken for three main reasons.

**Discovery is broken.** People rely on WhatsApp forwards, neighborhood Facebook groups, and word of mouth. There is no structured way to find the right person for the right job.

**Trust is missing.** There is no rating system, no accountability, and no way to verify if a worker is actually skilled or reliable before they show up at your door.

**Pricing is unfair.** There are no standard prices. Workers charge whatever they can get away with. Users overpay out of ignorance and workers underearn because they have no market visibility.

This results in missed opportunities, poor service quality, pricing disputes, no follow up, and zero accountability on either side.

---

## 3. Solution Summary

Karigar.ai replaces the entire informal hiring process with a seven agent AI workflow. The user describes what they need in plain language — any language, any spelling, any mix of Urdu and English. The system takes it from there.

```
User says what they need
        ↓
AI understands the request
        ↓
AI finds and ranks the best providers
        ↓
AI checks availability and confirms a slot
        ↓
AI calculates a fair transparent price
        ↓
AI confirms the booking and sends notifications
        ↓
AI tracks the job and collects feedback
        ↓
AI handles any complaints or disputes
```

Every step is visible. Every decision is logged. The user is never left wondering what is happening or why.

---

## 4. PWA Architecture

Karigar.ai is built as a Progressive Web Application meaning it works like a native mobile app, can be installed on a home screen, works offline for non AI features, and does not require an App Store download.

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│                                                         │
│   index.html + style.css + app.js (Single Bundle)      │
│   Service Worker (sw.js) for offline caching           │
│   Web App Manifest (manifest.json) for installability  │
│   localStorage for persistent user data               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS Fetch Calls
                     │
┌────────────────────▼────────────────────────────────────┐
│                 ANTIGRAVITY LAYER                       │
│                                                         │
│   Google Antigravity — Master Agent Orchestrator       │
│   Controls agent sequencing and handoffs               │
│   Generates implementation plans and task lists        │
│   Logs all reasoning traces                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Agent Calls
                     │
┌────────────────────▼────────────────────────────────────┐
│                   AGENT LAYER                           │
│                                                         │
│  Agent 1: Language Understanding                       │
│  Agent 2: Provider Matching                            │
│  Agent 3: Scheduling Intelligence                      │
│  Agent 4: Dynamic Pricing                              │
│  Agent 5: Booking Simulation                           │
│  Agent 6: Service Quality Loop                         │
│  Agent 7: Dispute and Escalation                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ API Calls
                     │
┌────────────────────▼────────────────────────────────────┐
│                  EXTERNAL SERVICES                      │
│                                                         │
│  Gemini 2.0 Flash API — All AI reasoning               │
│  Web Speech API — Voice input                          │
│  Google Maps/Places API — Location (mock)              │
│  providers.json — Mock provider database               │
│  localStorage — User profile, bookings, history        │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| App Shell | HTML5, CSS3, Vanilla JS | Single file PWA |
| AI Orchestrator | Google Antigravity | Agent coordination |
| AI Engine | Gemini 2.0 Flash API | All reasoning tasks |
| Voice Input | Web Speech API | Urdu and English voice |
| Fonts | Google Fonts — Poppins, Noto Nastaliq Urdu | Multilingual typography |
| Storage | localStorage | User data, bookings, history |
| Hosting | Netlify (Free) | PWA deployment |
| Version Control | GitHub | Code repository |
| Mock Data | providers.json | Provider database |
| PWA Features | Service Worker, Manifest | Offline and installability |

---

## 6. Application Structure

```
karigar-ai/
│
├── index.html              Main app shell with all screens
├── manifest.json           PWA manifest for home screen install
├── sw.js                   Service worker for offline caching
├── providers.json          Mock provider database (25 providers)
├── README.md               Full documentation
│
├── assets/
│   ├── icons/              PWA icons in multiple sizes
│   └── logo.svg            Karigar.ai logo
│
└── docs/
    ├── system-design.md    This document
    ├── agent-traces/       Antigravity trace logs per agent
    └── architecture.png    Architecture diagram
```

All core logic lives in index.html as a single deployable file. This keeps the submission simple, portable, and easy for judges to review and run locally.

---

## 7. The 7 Agent System

### Agent 1 — Language Understanding Agent

**Trigger:** User submits a service request via text or voice
**Input:** Raw natural language string in any language or mix
**Output:** Structured JSON with extracted service details and confidence score

**What it does:**
- Detects language automatically (Urdu, Roman Urdu, English, mixed)
- Handles misspellings, slang, incomplete sentences
- Extracts service type, location, urgency, time preference, budget sensitivity
- Generates a confidence score from 0 to 100
- If confidence is below 80, generates one targeted clarification question
- Passes structured output to Agent 2 only after confidence is above 80

**Gemini Prompt Template:**
```
You are a multilingual service request parser for Pakistan.
Parse this user input: "[USER_INPUT]"
Handle Urdu, Roman Urdu, English, misspellings, slang, and code-switching.
Return ONLY valid JSON:
{
  "serviceType": "",
  "issueDescription": "",
  "severity": "low | medium | high",
  "location": "",
  "preferredDate": "",
  "preferredTimeWindow": "",
  "isoTimeFrom": "",
  "isoTimeTo": "",
  "priceSensitivity": "low | medium | high",
  "detectedLanguage": "",
  "confidenceScore": 0-100,
  "clarificationNeeded": true | false,
  "clarificationQuestion": ""
}
```

**Confidence Score Logic:**

| Score | Action |
|---|---|
| 90 to 100 | Proceed directly to Agent 2 |
| 80 to 89 | Show parsed summary and ask user to confirm |
| 60 to 79 | Ask one clarification question before proceeding |
| Below 60 | Ask user to rephrase with guided prompts |

---

### Agent 2 — Provider Matching Agent

**Trigger:** Receives confirmed structured request from Agent 1
**Input:** Service request JSON plus full providers.json dataset
**Output:** Ranked list of top 3 providers with match scores and rationale

**What it does:**
- Classifies job complexity as basic, intermediate, or complex
- Filters providers by service type and city
- Scores each provider using a weighted 10 factor algorithm
- Returns ranked list with plain language rationale per provider
- Flags any provider with a risk warning

**Gemini Prompt Template:**
```
You are a provider matching engine for Karigar.ai in Pakistan.
Service Request: [REQUEST_JSON]
Available Providers: [PROVIDERS_JSON]

Step 1: Classify job complexity as basic, intermediate, or complex.
Step 2: Filter providers who can handle this service type and location.
Step 3: Score each provider using the weighted factors below.
Step 4: Rank and return top 3 with rationale.

Scoring Weights:
- Skill match to job complexity: 20%
- Overall rating: 20%
- On time score: 15%
- Review recency and sentiment: 10%
- Cancellation rate (inverted): 10%
- Distance and travel time: 10%
- Risk score (inverted): 5%
- Price competitiveness: 5%
- Capacity availability: 3%
- Certifications: 2%

Return ONLY valid JSON:
{
  "jobComplexity": "",
  "totalProvidersEvaluated": 0,
  "rankedProviders": [
    {
      "providerId": "",
      "name": "",
      "matchScore": 0-100,
      "rankingRationale": "",
      "whyNotFirst": "",
      "estimatedArrival": "",
      "riskFlag": true | false,
      "riskReason": ""
    }
  ]
}
```

---

### Agent 3 — Scheduling Intelligence Agent

**Trigger:** User selects a provider from Agent 2 results
**Input:** Provider ID, requested time window, provider's existing booked slots
**Output:** Confirmed slot or alternative options

**What it does:**
- Checks provider booked slots against requested time
- Applies 30 minute travel buffer between consecutive jobs
- Detects double booking conflicts
- Suggests three alternative time slots if conflict exists
- Manages a simple waitlist if user prefers to wait for a specific provider
- Handles provider cancellation by auto promoting next ranked provider

**Scheduling Rules:**
```
Rule 1: No two bookings within 30 minutes of each other including travel time
Rule 2: No bookings before 07:00 or after 21:00
Rule 3: If conflict exists always suggest alternatives before rejecting
Rule 4: If provider cancels after confirmation reassign within 15 minutes
Rule 5: Waitlist maximum is 3 users per provider per day
```

**Gemini Prompt Template:**
```
You are a scheduling agent for Karigar.ai.
Provider booked slots: [SLOTS_ARRAY]
Requested time window: [FROM] to [TO]
Travel buffer required: 30 minutes
Working hours: 07:00 to 21:00

Check for conflicts. Apply travel buffer to adjacent bookings.
Return ONLY valid JSON:
{
  "status": "confirmed | conflict | cancelled",
  "confirmedSlot": "",
  "conflictReason": "",
  "alternativeSlots": ["", "", ""],
  "waitlistAvailable": true | false,
  "waitlistPosition": 0,
  "nextAvailableTime": ""
}
```

---

### Agent 4 — Dynamic Pricing Agent

**Trigger:** Slot confirmed by Agent 3
**Input:** Provider details, service request, scheduling context, user loyalty status
**Output:** Full price breakdown with budget alternative

**Pricing Formula:**

```
Final Price = Visit Fee
            + (Distance in KM x Rate per KM)
            + (Complexity Multiplier x Base Rate)
            + Urgency Surcharge
            + Time of Day Adjustment
            - Loyalty Discount
            + Demand Surge Adjustment
```

**Pricing Factor Reference:**

| Factor | Value |
|---|---|
| Visit Fee | PKR 300 to 800 based on provider tier |
| Distance Rate | PKR 20 per KM |
| Complexity — Basic | 1.0x base rate |
| Complexity — Intermediate | 1.4x base rate |
| Complexity — Complex | 1.8x base rate |
| Urgency — Same Day | PKR 300 surcharge |
| Urgency — Within 2 Hours | PKR 600 surcharge |
| Morning Rate 07:00 to 10:00 | No adjustment |
| Evening Rate 18:00 to 21:00 | 10% premium |
| Loyalty Discount | 5% for returning users |
| Demand Surge | Up to 20% when 3 or more requests in same area |

**Gemini Prompt Template:**
```
You are a pricing agent for Karigar.ai in Pakistan.
Calculate a fair transparent quote using these inputs:
Provider base rate per hour: [RATE]
Visit fee: [FEE]
Distance from provider to user: [KM] kilometers
Job complexity: [basic | intermediate | complex]
Urgency level: [low | medium | high]
Requested time: [TIME]
User loyalty status: [new | returning]
Current demand in area: [low | medium | high]

Return ONLY valid JSON:
{
  "totalEstimatedPKR": 0,
  "breakdown": [
    { "label": "", "amountPKR": 0 }
  ],
  "providerEarningPKR": 0,
  "platformFeePKR": 0,
  "budgetAlternative": {
    "description": "",
    "savingPKR": 0,
    "tradeoff": ""
  },
  "fairnessSummaryUser": "",
  "fairnessSummaryProvider": "",
  "surgeApplied": true | false,
  "surgeReason": ""
}
```

---

### Agent 5 — Booking Simulation Agent

**Trigger:** User confirms price and approves booking
**Input:** Full booking object with user, provider, slot, price details
**Output:** Step by step booking lifecycle simulation

**Simulation Steps:**

```
Step 1:  Booking Created          — Booking ID generated
Step 2:  Provider Notified        — Mock WhatsApp message shown
Step 3:  Provider Accepted        — Confirmation received
Step 4:  Calendar Updated         — Slot locked in system
Step 5:  Confirmation SMS Sent    — Mock SMS to user shown
Step 6:  Reminder Scheduled       — 1 hour before reminder queued
Step 7:  Reminder Fired           — Shown at T minus 60 minutes
Step 8:  Provider En Route        — Mock map tracker shown
Step 9:  Provider Arrived         — Arrival confirmation
Step 10: Job Started              — Timer started
Step 11: Job Completed            — Completion checklist shown
Step 12: Invoice Generated        — Final receipt shown
Step 13: Feedback Requested       — Triggers Agent 6
```

Each step appears with a 1.5 second animated delay to simulate real time progression. Steps are shown as an animated vertical timeline with colored status indicators.

---

### Agent 6 — Service Quality Loop Agent

**Trigger:** Job marked complete in Agent 5
**Input:** Provider details, booking summary, user star rating, written comment
**Output:** Updated reputation score, sentiment analysis, matching priority adjustment

**What it does:**
- Analyses feedback sentiment using Gemini
- Recalculates provider rating using weighted average giving 20% weight to new rating
- Determines if provider's future matching priority should change
- Updates provider record in localStorage
- Generates a warm thank you message in the user's language

**Rating Update Formula:**
```
New Rating = (Existing Rating x 0.80) + (New Rating x 0.20)
```

**Gemini Prompt Template:**
```
You are a service quality analyst for Karigar.ai.
Provider: [PROVIDER_JSON]
User rating given: [1-5]
User comment: "[COMMENT]"
Booking details: [BOOKING_JSON]

Analyse the feedback. Return ONLY valid JSON:
{
  "sentimentScore": -1 to 1,
  "sentimentLabel": "positive | neutral | negative",
  "updatedRating": 0.0,
  "matchingPriorityChange": "increase | unchanged | decrease",
  "changeReason": "",
  "flagForReview": true | false,
  "flagReason": "",
  "thankYouMessageUrdu": "",
  "thankYouMessageEnglish": ""
}
```

---

### Agent 7 — Dispute and Escalation Agent

**Trigger:** User taps Report a Problem after service completion
**Input:** Dispute type, user description, provider history, booking details
**Output:** Resolution decision with compensation and action

**Dispute Types Handled:**
- Provider no show
- Price higher than quoted
- Poor quality work
- Provider rude or unprofessional
- Wrong service performed
- Refund request
- Booking cancelled last minute

**Escalation Rules:**
```
Rule 1: Provider with 3 or more disputes in 30 days gets warning flag
Rule 2: Provider with 5 or more disputes gets temporarily suspended
Rule 3: Refund requests above PKR 5000 always escalate to human review
Rule 4: No show by provider triggers automatic rebooking offer
Rule 5: Price dispute always includes comparison with original quoted price
```

**Gemini Prompt Template:**
```
You are a dispute resolution agent for Karigar.ai in Pakistan.
Dispute type: [TYPE]
User description: "[DESCRIPTION]"
Provider history: [RATING, CANCELLATION_RATE, PREVIOUS_DISPUTES]
Original quoted price: [PRICE]
Amount charged: [CHARGED]
Booking details: [BOOKING_JSON]

Assess the dispute fairly. Return ONLY valid JSON:
{
  "disputeSeverity": "low | medium | high",
  "likelyFault": "user | provider | unclear",
  "recommendedAction": "refund | partial_refund | rebook | warning | suspend | escalate",
  "compensationPKR": 0,
  "compensationReason": "",
  "messageToUser": "",
  "messageToProvider": "",
  "escalateToHuman": true | false,
  "escalationReason": "",
  "providerPenaltyApplied": true | false,
  "penaltyDetails": ""
}
```

---

## 8. Provider Dataset Schema

Each provider in providers.json follows this structure:

```json
{
  "id": "P001",
  "name": "Usman AC Services",
  "phone": "0300-1234567",
  "profilePhoto": "avatar_placeholder",
  "skill": "AC Repair",
  "specializations": ["Split AC", "Window AC", "Gas Refill", "Installation"],
  "jobComplexityHandled": ["basic", "intermediate", "complex"],
  "certifications": ["HVAC Certified", "Samsung Authorized"],
  "city": "Islamabad",
  "areas": ["G-13", "G-11", "F-10", "F-8", "I-8"],
  "coordinates": { "lat": 33.6844, "lng": 73.0479 },
  "rating": 4.7,
  "totalReviews": 312,
  "recentReviewDate": "2026-05-16",
  "recentReviewSentiment": "positive",
  "onTimeScore": 91,
  "cancellationRate": 3,
  "reliabilityScore": 88,
  "riskScore": "low",
  "disputeCount": 1,
  "visitFee": 500,
  "hourlyRatePKR": 1500,
  "ratePerKM": 20,
  "loyaltyDiscount": 5,
  "available": true,
  "bookedSlots": [
    "2026-05-19 09:00",
    "2026-05-19 14:00"
  ],
  "maxDailyCapacity": 4,
  "currentDayBookings": 2,
  "yearsExperience": 8,
  "languagesSpoken": ["Urdu", "Punjabi"],
  "tier": "premium"
}
```

The mock dataset includes 25 providers across 5 service categories and 5 cities. Providers are deliberately varied in quality so the matching agent has meaningful decisions to make.

**Provider Distribution:**

| Service Type | Count |
|---|---|
| AC Technician | 6 |
| Electrician | 5 |
| Plumber | 5 |
| Home Tutor | 5 |
| Mechanic | 4 |

| City | Count |
|---|---|
| Islamabad | 7 |
| Karachi | 6 |
| Lahore | 6 |
| Peshawar | 3 |
| Multan | 3 |

---

## 9. Matching Algorithm

Agent 2 uses a weighted multi factor scoring system. Each provider receives a score from 0 to 100.

```
Match Score = 
  (Skill Match Score        x 0.20) +
  (Rating Score             x 0.20) +
  (On Time Score            x 0.15) +
  (Review Score             x 0.10) +
  (Cancellation Score       x 0.10) +
  (Distance Score           x 0.10) +
  (Risk Score               x 0.05) +
  (Price Score              x 0.05) +
  (Capacity Score           x 0.03) +
  (Certification Score      x 0.02)
```

**Score Calculation per Factor:**

```
Skill Match Score:
  Exact specialization match = 100
  General skill match = 70
  Adjacent skill = 40
  No match = 0

Rating Score:
  Score = (Rating / 5) x 100

On Time Score:
  Score = On Time Percentage directly

Review Score:
  Positive sentiment + within 7 days = 100
  Positive sentiment + within 30 days = 80
  Neutral sentiment = 50
  Negative sentiment = 20

Cancellation Score:
  Score = 100 - (Cancellation Rate x 5)

Distance Score:
  Under 5 KM = 100
  5 to 10 KM = 75
  10 to 20 KM = 50
  Over 20 KM = 25

Risk Score:
  Low risk = 100
  Medium risk = 60
  High risk = 20

Price Score:
  Cheapest available = 100
  Scaled down proportionally

Capacity Score:
  Slots remaining today vs max capacity as percentage

Certification Score:
  Certified = 100
  Not certified = 0
```

**Tiebreaker Rule:**
If two providers have scores within 3 points of each other, the one with the higher on time score wins.

---

## 10. Dynamic Pricing Model

```
Base Calculation:
  Total = Visit Fee + (Hours Estimated x Hourly Rate)

Distance Adjustment:
  Total += Distance in KM x PKR 20

Complexity Multiplier:
  Basic job: Total x 1.0
  Intermediate job: Total x 1.4
  Complex job: Total x 1.8

Urgency Surcharge:
  Scheduled 24+ hours ahead: PKR 0
  Same day booking: PKR 300
  Within 2 hours: PKR 600

Time of Day Premium:
  07:00 to 17:00: No adjustment
  17:00 to 21:00: Total x 1.10

Loyalty Discount:
  Returning user: Total x 0.95

Demand Surge:
  3+ requests in same area within 1 hour: Total x 1.15
  5+ requests in same area within 1 hour: Total x 1.20

Platform Fee:
  10% of Total (shown separately, not added to user price)

Provider Earning:
  Total minus Platform Fee
```

**Budget Alternative Logic:**
If user's price sensitivity is high, Agent 4 also calculates an alternative option such as scheduling for next morning instead of same day to remove urgency surcharge, or choosing a nearby provider with lower visit fee.

---

## 11. Scheduling Engine

**Double Booking Prevention:**
```
For each new booking request:
  1. Get provider's existing booked slots
  2. Add 30 minute travel buffer to each slot end time
  3. Check if requested time overlaps with any buffered slot
  4. If overlap found mark as conflict
  5. Find next 3 available windows and return as alternatives
```

**Automatic Rescheduling on Provider Cancellation:**
```
1. Provider cancels confirmed booking
2. System immediately queries Agent 2 results for same request
3. Takes next ranked provider that was not selected
4. Checks their availability for same time window
5. If available auto assign and notify user
6. If not available find next slot and offer to user
7. All of this happens within 15 minutes of cancellation
```

**Waitlist Management:**
```
If user prefers specific provider who is fully booked:
  1. Add user to waitlist for that provider
  2. Maximum 3 users per provider per day on waitlist
  3. If a slot opens due to cancellation notify first waitlist user
  4. Give waitlist user 15 minutes to confirm before moving to next
```

---

## 12. Multilingual System

Karigar.ai handles three language modes across all UI text and all AI responses.

| Mode | Code | Direction | Font |
|---|---|---|---|
| English | en | LTR | Poppins |
| Roman Urdu | ur-rom | LTR | Poppins |
| Urdu Script | ur | RTL | Noto Nastaliq Urdu |

**Language is applied at two levels:**

Level 1 — UI Labels: All static text in the app switches based on the language toggle. Every label, button, placeholder, and message is stored in a translations object in JavaScript.

Level 2 — AI Responses: Every Gemini prompt includes the instruction "Respond in [selected language]" so all AI generated content also switches automatically.

**Voice Input Language Mapping:**
```javascript
const speechLangMap = {
  "en": "en-US",
  "ur-rom": "ur-PK",
  "ur": "ur-PK"
}
```

**Input Normalization for Noisy Text:**
Agent 1 is specifically prompted to handle:
- Common Roman Urdu spellings (acha, theek, kal, subah)
- Mixed language sentences (Mujhe kal AC fix karwana hai in G-13)
- Misspellings (electrican, plummer, AC thecnician)
- Abbreviated time references (kal, parso, aaj shaam)
- Informal location references (G-13, Defence, Gulshan)

---

## 13. Booking Lifecycle

```
STATE MACHINE:

[REQUESTED] 
    → Agent 1 parses request
    → Confidence check
[UNDERSTOOD]
    → Agent 2 ranks providers
    → User selects provider
[PROVIDER_SELECTED]
    → Agent 3 checks scheduling
    → Slot confirmed or alternatives offered
[SLOT_CONFIRMED]
    → Agent 4 calculates price
    → User approves price
[PRICE_APPROVED]
    → Agent 5 begins booking simulation
[BOOKING_CONFIRMED]
    → Provider notified (mock)
    → Calendar updated
    → Reminder scheduled
[IN_PROGRESS]
    → Provider en route
    → Arrival confirmed
    → Job started
[COMPLETED]
    → Feedback collected
    → Agent 6 updates reputation
[CLOSED]
    OR
[DISPUTED]
    → Agent 7 resolves
[RESOLVED]
```

Each state is stored in localStorage. If the user closes the app and returns, the booking picks up from the last known state.

---

## 14. Dispute Resolution Workflow

```
User reports problem
        ↓
Select dispute type from list
        ↓
Write description in any language
        ↓
Agent 7 receives: dispute type + description + provider history + booking
        ↓
Gemini assesses likely fault
        ↓
┌───────────────┬────────────────┬──────────────────┐
│  User Fault   │ Provider Fault │    Unclear        │
│               │                │                   │
│ Explain why   │ Issue refund   │ Ask one more      │
│ Close dispute │ or partial     │ question then     │
│               │ refund         │ reassess          │
│               │ Apply warning  │                   │
│               │ to provider    │                   │
└───────────────┴────────────────┴──────────────────┘
        ↓
Escalate to human if:
  - Refund above PKR 5000
  - Provider has 5+ disputes
  - Fault is genuinely unclear after reassessment
  - User explicitly requests human review
        ↓
Update provider record
Update dispute log in localStorage
Show resolution to user in their language
```

---

## 15. Agent Trace and Logging System

Every agent writes a structured log entry to a global array called `agentTraces` stored in localStorage. This array is displayed in a collapsible drawer accessible from a floating button on every screen.

**Log Entry Structure:**
```javascript
{
  agentId: "agent_2",
  agentName: "Provider Matching Agent",
  timestamp: "2026-05-19T10:23:45Z",
  inputSummary: "AC Repair request in G-13, tomorrow morning",
  decision: "Ranked 8 providers. Provider P001 scored 87/100",
  rationale: "P001 selected over P003 despite P003 being closer because P001 has 91% on-time score vs P003 at 67% and AC specialization certification",
  outputSummary: "Top 3: P001 (87), P005 (74), P008 (68)",
  confidenceScore: 94,
  fallbackTriggered: false,
  processingTimeMs: 1240
}
```

**Trace Panel UI:**
The trace panel opens as a slide-in drawer from the right. It shows all agent logs in chronological order. Each entry is color coded by agent. Judges can scroll through the full reasoning chain of any booking in real time.

---

## 16. Screen by Screen UI Plan

### Screen 1 — Home
- App logo and name at top
- Search bar with microphone button
- Trending services in user's city as horizontal scrolling chips
- Recent bookings section if user has history
- Bottom navigation bar with 5 tabs

### Screen 2 — Request Flow
- Shows Agent 1 output after user submits request
- Confidence score badge in top right corner
- Parsed details shown as editable summary card
- Clarification question shown if confidence is below 80
- Proceed to Matching button

### Screen 3 — Provider Selection
- Shows top 3 ranked providers as cards
- Each card has: photo placeholder, name, rating stars, match score ring, estimated arrival time, price estimate
- Why This Provider button opens a popup with full rationale
- Risk flag badge if provider has warning
- Select Provider button on each card

### Screen 4 — Scheduling
- Calendar style date picker
- Time slot grid showing available and unavailable slots
- Conflict message with 3 alternative suggestions if needed
- Waitlist toggle if preferred provider is unavailable
- Confirm Slot button

### Screen 5 — Pricing
- Receipt style breakdown card
- Each line item shown with label and amount in PKR
- Total highlighted in green
- Budget alternative card below main price
- Fairness summary for user
- Confirm and Book button

### Screen 6 — Booking Tracker
- Animated vertical timeline with 13 steps
- Each step appears with a 1.5 second delay
- Mock WhatsApp notification bubble for notification steps
- Mock map with moving provider marker for en route step
- View Receipt button after completion

### Screen 7 — Feedback
- 5 star rating selector
- Optional comment box in user's language
- Submit Feedback button
- Shows updated provider rating after submission
- Thank you message in user's language

### Screen 8 — Dispute Center
- Report a Problem button visible after any completed booking
- Dispute type selector with clear labels in Urdu and English
- Description text area
- Submit Dispute button
- Resolution card shown after Agent 7 processes
- Human Support button if escalation triggered

### Screen 9 — Agent Trace Panel
- Slide in drawer from floating button
- All 7 agent logs in order
- Each log shows: agent name, decision, rationale, confidence, time taken
- Export Logs button copies all traces as plain text

---

## 17. Data Flow Diagrams

### Complete Request Flow:
```
[User Input] ──────────────────────────────────────────────┐
                                                           │
[Agent 1: Language] ─── confidence < 80 ──► [Clarify]    │
       │                                                   │
       │ confidence >= 80                                  │
       ▼                                                   │
[Agent 2: Matching] ─── no providers ──► [Fallback Msg]  │
       │                                                   │
       │ providers found                                   │
       ▼                                                   │
[User Selects Provider]                                    │
       │                                                   │
       ▼                                                   │
[Agent 3: Scheduling] ─── conflict ──► [Alternatives]    │
       │                                                   │
       │ slot confirmed                                    │
       ▼                                                   │
[Agent 4: Pricing] ─── user rejects ──► [Budget Alt]    │
       │                                                   │
       │ user confirms                                     │
       ▼                                                   │
[Agent 5: Booking] ─── provider cancels ──► [Rebook]    │
       │                                                   │
       │ job completes                                     │
       ▼                                                   │
[Agent 6: Quality] ─── negative feedback ──► [Flag]     │
       │                                                   │
       │ dispute filed                                     │
       ▼                                                   │
[Agent 7: Dispute] ─── escalate ──► [Human Support]     │
       │                                                   │
       ▼                                                   │
[Booking Closed] ◄─────────────────────────────────────────┘
```

---

## 18. APIs and Integrations

| API | Usage | Status |
|---|---|---|
| Gemini 2.0 Flash | All AI reasoning across all 7 agents | Real |
| Google Antigravity | Master orchestrator for all agents | Real |
| Web Speech API | Voice input in Urdu and English | Real (browser native) |
| Google Fonts API | Poppins and Noto Nastaliq Urdu | Real |
| Google Maps/Places | Provider location and distance | Mock coordinates |
| WhatsApp Notifications | Provider and user notifications | Simulated |
| SMS Gateway | Booking reminders | Simulated |
| Payment Gateway | Transaction processing | Simulated |
| providers.json | Provider database | Mock dataset |

**Gemini API Call Structure:**
```javascript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048
      }
    })
  }
);
```

Low temperature of 0.3 is used for all structured JSON responses to keep output consistent and parseable.

---

## 19. Edge Cases and Fallbacks

| Scenario | Detection | Fallback |
|---|---|---|
| No provider available in area | Agent 2 returns empty ranked list | Show nearest available area with providers |
| Low confidence language input | Agent 1 confidence below 80 | Ask one targeted clarification question |
| Two users book same provider simultaneously | Agent 3 detects slot conflict on second booking | Auto assign next ranked provider |
| Provider cancels after confirmation | Status change detected | Auto reschedule from ranked list within 15 minutes |
| Gemini API fails or times out | Try catch on every fetch call | Show friendly retry message in Urdu |
| User has no internet | Service worker detects offline status | Show offline banner, disable AI features, show cached bookings |
| Price dispute after service | User reports higher than quoted price | Agent 7 compares quoted vs charged and resolves automatically |
| Malformed JSON from Gemini | JSON parse in try catch | Strip markdown fences, retry once, show error if still fails |
| User input is empty | Check before API call | Show guided prompt suggestions |
| Provider rating drops below 3.0 | Agent 6 flags after update | Add review flag, reduce matching priority |

---

## 20. PWA Offline Strategy

**Service Worker Caches:**
```
Cache 1 — App Shell (permanent)
  index.html, manifest.json, all fonts, all icons

Cache 2 — Static Data (24 hour refresh)
  providers.json

Cache 3 — User Data (localStorage, always available)
  Profile, saved bookings, chat history, agent traces
```

**Network Strategy:**
```
For app shell: Cache first, network fallback
For Gemini API calls: Network only, show offline message if fails
For providers.json: Cache first, refresh in background
For user localStorage: Always available offline
```

**Offline Capabilities:**
- View saved and past bookings
- View saved provider profiles
- Read agent trace logs from previous sessions
- View receipt and booking details
- Access dispute history

**Online Only:**
- All AI agent features
- New booking requests
- Real time provider updates
- Feedback submission

---

## 21. Security and Privacy

**Data Storage:**
All user data is stored in localStorage on the user's own device only. No user data is sent to any server other than the Gemini API for AI processing.

**API Key Protection:**
The Gemini API key is stored as a JavaScript constant. For production deployment this should be moved to an environment variable or a serverless proxy function. For this hackathon prototype the key is stored client side.

**No PII Transmitted:**
User names and phone numbers in the prototype are mock data only. No real personal information is collected or stored outside the local device.

**Gemini Data Policy:**
Requests to the Gemini API are subject to Google's standard API data usage policies. Users should be informed that their service request text is processed by Gemini for AI analysis.

**Privacy Notice (shown on first launch):**
A one sentence notice informs users that their requests are processed by Google Gemini AI and no personal data is stored on external servers.

---

## 22. Performance Plan

**Target Metrics:**

| Metric | Target |
|---|---|
| First Contentful Paint | Under 1.5 seconds |
| Time to Interactive | Under 2 seconds |
| Gemini Response Time | Under 3 seconds per agent |
| Full Booking Flow Time | Under 90 seconds end to end |
| Offline Load Time | Under 0.5 seconds |
| Lighthouse PWA Score | Above 90 |

**Optimization Strategies:**
- All CSS and JS inline in single HTML file, zero network round trips for app shell
- Google Fonts loaded with display=swap to prevent render blocking
- providers.json loaded once on startup and cached in memory for the session
- Gemini calls use temperature 0.3 and max 2048 tokens to minimize latency
- Agent trace logs written asynchronously so they do not block UI rendering
- All animations use CSS transforms rather than layout properties to stay on GPU

---

## 23. Deployment Plan

**Step 1 — Local Testing**
Open index.html in Chrome. Add your Gemini API key. Test all 7 agents with the 4 stress test scenarios from the requirements.

**Step 2 — GitHub Repository**
Create a public repository called karigar-ai. Upload index.html, manifest.json, sw.js, providers.json, and README.md.

**Step 3 — Netlify Deployment**
Go to netlify.com. Drag and drop the project folder. Netlify generates a live URL automatically. Test the deployed URL on a real mobile device.

**Step 4 — PWA Installation Test**
Open the Netlify URL in Chrome on Android. Tap Add to Home Screen. Confirm the app installs correctly and the icon and name appear as configured in manifest.json.

**Step 5 — Submission**
Submit the Netlify URL as the mobile app link and the GitHub repository URL to the hackathon form.

---

## 24. Testing Plan

**Test Scenario 1 — Happy Path**
Input: "AC theek karo G-13 mein kal subah, budget theek hai"
Expected: Full flow from request to booking confirmation without any clarification needed

**Test Scenario 2 — Low Confidence Input**
Input: "ac wala chahiye yar"
Expected: Agent 1 asks for location and time before proceeding

**Test Scenario 3 — No Provider Available**
Input: Request for AC repair in a city with no available providers in dataset
Expected: System suggests nearest city with available providers

**Test Scenario 4 — Scheduling Conflict**
Input: Request for Provider P001 at 09:00 when P001 already has a booking at 09:30
Expected: Conflict detected, three alternative slots offered

**Test Scenario 5 — Double Booking Race**
Input: Two simultaneous requests for same provider at same time
Expected: First confirmed, second gets next ranked provider with explanation

**Test Scenario 6 — Price Dispute**
Input: After booking completion, user reports charged PKR 3500 vs quoted PKR 2100
Expected: Agent 7 detects discrepancy, recommends partial refund, applies warning to provider

**Test Scenario 7 — Urdu Script Input**
Input: "مجھے کل صبح G-13 میں AC ٹھیک کروانا ہے"
Expected: Agent 1 correctly parses all fields with above 85 confidence

**Test Scenario 8 — Provider Cancellation**
Input: Simulate provider cancelling a confirmed booking
Expected: Auto reassignment to next ranked provider within 15 minutes

---

## 25. Known Limitations

- Provider dataset is mock data. No real provider database or live API integration.
- Maps integration uses placeholder coordinates. No real distance calculation.
- WhatsApp and SMS notifications are simulated within the app UI only.
- Payment processing is simulated. No real payment gateway integrated.
- The Gemini API key is stored client side in this prototype which is not production safe.
- Voice input quality depends on the user's browser and microphone. Chrome gives best results.
- Scheduling conflict detection works on mock localStorage data only. Not a real calendar system.
- The app has been tested on Chrome and Safari mobile browsers. Other browsers may have minor UI differences.

---

## 26. Future Roadmap

**Version 2.0 — Real Backend**
- Firebase Firestore as live provider database
- Real time availability updates via WebSocket
- Actual Google Maps Distance Matrix API for travel time

**Version 3.0 — Provider App**
- Separate PWA for service workers to manage their profile, accept bookings, and update job status
- Push notifications via Firebase Cloud Messaging

**Version 4.0 — Payments**
- JazzCash or EasyPaisa integration for in app payments
- Escrow model where payment is held until job is marked complete

**Version 5.0 — Trust Layer**
- CNIC based provider verification
- Video skill assessment before onboarding
- Community vouching system where verified users endorse providers

---

## Document Information

| Field | Value |
|---|---|
| App Name | Karigar.ai |
| Version | 1.0 Prototype |
| Hackathon | AI Seekho 2026 |
| Challenge | Challenge 2: AI Service Orchestrator |
| Domain | Digital Inclusion |
| Built With | Google Antigravity + Gemini API |
| Last Updated | May 2026 |

---

*Built for AI Seekho 2026 — Har Karigar, Ek Click Dur*
