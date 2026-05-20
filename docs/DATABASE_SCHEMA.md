# DATABASE_SCHEMA.md

## Karigar.ai — Database Schema Documentation

### Supabase (PostgreSQL)

---

### Table: `profiles`

User profiles extending Supabase auth.users.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | uuid | — | Primary key, references auth.users(id) |
| `full_name` | text | — | User's display name |
| `phone` | text | — | Phone number |
| `city` | text | — | User's city |
| `area` | text | — | User's area/neighborhood |
| `loyalty_status` | text | 'new' | 'new' or 'returning' |
| `language_preference` | text | 'en' | 'en', 'ur-rom', or 'ur' |
| `onboarding_completed` | boolean | false | Whether user completed onboarding |
| `created_at` | timestamptz | now() | Record creation time |
| `updated_at` | timestamptz | now() | Last update time |

**RLS Policies:**
- Users can SELECT their own profile only
- Users can UPDATE their own profile only
- Service role can access all profiles

**Triggers:**
- `updated_at` automatically set on UPDATE

---

### Table: `providers`

Service provider records (250 demo records).

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | text | — | Primary key (e.g., "P001") |
| `name` | text | — | Provider display name |
| `phone` | text | — | Contact number |
| `skill` | text | — | Primary skill category |
| `specializations` | text[] | '{}' | Specific specializations |
| `job_complexity_handled` | text[] | '{}' | Complexity levels handled |
| `certifications` | text[] | '{}' | Professional certifications |
| `city` | text | — | Service city |
| `areas` | text[] | '{}' | Service areas |
| `lat` | numeric | — | Latitude |
| `lng` | numeric | — | Longitude |
| `rating` | numeric | 0 | Average rating (0-5) |
| `total_reviews` | integer | 0 | Total review count |
| `recent_review_date` | date | — | Date of most recent review |
| `recent_review_sentiment` | text | — | Sentiment of recent review |
| `on_time_score` | integer | 0 | On-time delivery percentage |
| `cancellation_rate` | integer | 0 | Cancellation percentage |
| `reliability_score` | integer | 0 | Overall reliability score |
| `risk_score` | text | 'low' | 'low', 'medium', or 'high' |
| `dispute_count` | integer | 0 | Number of disputes |
| `visit_fee` | integer | 300 | Base visit fee in PKR |
| `hourly_rate_pkr` | integer | 1000 | Hourly rate in PKR |
| `rate_per_km` | integer | 20 | Travel rate per KM |
| `loyalty_discount` | integer | 5 | Loyalty discount percentage |
| `available` | boolean | true | Availability status |
| `booked_slots` | timestamptz[] | '{}' | Booked time slots |
| `max_daily_capacity` | integer | 4 | Max jobs per day |
| `current_day_bookings` | integer | 0 | Current day's bookings |
| `years_experience` | integer | 0 | Years of experience |
| `languages_spoken` | text[] | '{}' | Languages spoken |
| `tier` | text | 'standard' | 'basic', 'standard', or 'premium' |
| `created_at` | timestamptz | now() | Record creation time |

**RLS Policies:**
- Public read access (no auth required)
- Service role can insert/update/delete

---

### Table: `bookings`

Booking records with full lifecycle tracking.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | uuid | gen_random_uuid() | Primary key |
| `user_id` | uuid | — | FK to profiles(id) |
| `provider_id` | text | — | FK to providers(id) |
| `service_type` | text | — | Type of service requested |
| `issue_description` | text | — | User's description of the issue |
| `severity` | text | — | 'low', 'medium', or 'high' |
| `location` | text | — | Service location |
| `price_sensitivity` | text | — | 'low', 'medium', or 'high' |
| `job_complexity` | text | — | 'basic', 'intermediate', or 'complex' |
| `status` | text | — | Current booking status |
| `total_price_pkr` | integer | — | Total price in PKR |
| `price_breakdown` | jsonb | — | Detailed price breakdown |
| `provider_earning_pkr` | integer | — | Provider's share |
| `platform_fee_pkr` | integer | — | Platform's share |
| `surge_applied` | boolean | false | Whether surge pricing applied |
| `preferred_time_window` | text | — | Requested time slot |
| `feedback_rating` | integer | — | User's star rating (1-5) |
| `feedback_comment` | text | — | User's written feedback |
| `created_at` | timestamptz | now() | Booking creation time |
| `updated_at` | timestamptz | now() | Last update time |

**Status Values:**
- `booking_confirmed` — Booking created and confirmed
- `in_progress` — Service is being performed
- `completed` — Service finished, awaiting feedback
- `closed` — Feedback submitted, booking complete
- `disputed` — Dispute filed
- `resolved` — Dispute resolved
- `cancelled` — Booking cancelled

**RLS Policies:**
- Users can SELECT their own bookings only
- Users can INSERT their own bookings
- Users can UPDATE their own bookings
- Service role can access all bookings

---

### Table: `disputes`

Dispute records with AI resolution data.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | uuid | gen_random_uuid() | Primary key |
| `booking_id` | uuid | — | FK to bookings(id) |
| `user_id` | uuid | — | FK to profiles(id) |
| `provider_id` | text | — | FK to providers(id) |
| `dispute_type` | text | — | Type of dispute |
| `user_description` | text | — | User's description |
| `dispute_severity` | text | — | 'low', 'medium', or 'high' |
| `likely_fault` | text | — | 'user', 'provider', or 'unclear' |
| `recommended_action` | text | — | Resolution action |
| `compensation_pkr` | integer | 0 | Compensation amount |
| `compensation_reason` | text | — | Reason for compensation |
| `message_to_user` | text | — | Message shown to user |
| `message_to_provider` | text | — | Message shown to provider |
| `escalate_to_human` | boolean | false | Whether escalated |
| `escalation_reason` | text | — | Reason for escalation |
| `provider_penalty_applied` | boolean | false | Whether penalty applied |
| `penalty_details` | text | — | Penalty description |
| `status` | text | — | 'resolved', 'escalated', 'pending' |
| `created_at` | timestamptz | now() | Dispute creation time |

**Dispute Types:**
- `noShow` — Provider didn't show up
- `priceHigher` — Price higher than quoted
- `poorQuality` — Poor quality work
- `rudeBehavior` — Provider rude/unprofessional
- `wrongService` — Wrong service performed
- `refundRequest` — Refund requested
- `lastMinuteCancel` — Booking cancelled last minute

**RLS Policies:**
- Users can SELECT their own disputes only
- Users can INSERT their own disputes
- Service role can access all disputes

---

### Table: `agent_traces`

AI agent decision logs for transparency.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | uuid | gen_random_uuid() | Primary key |
| `booking_id` | uuid | — | FK to bookings(id) |
| `agent_id` | text | — | Agent identifier (e.g., 'agent_1') |
| `agent_name` | text | — | Agent display name |
| `timestamp` | timestamptz | now() | When the agent ran |
| `input_summary` | text | — | Summary of agent input |
| `decision` | text | — | Agent's decision |
| `rationale` | text | — | Reasoning behind decision |
| `output_summary` | text | — | Summary of agent output |
| `confidence_score` | integer | — | Confidence (0-100) |
| `processing_time_ms` | integer | — | Processing time in ms |
| `created_at` | timestamptz | now() | Record creation time |

**RLS Policies:**
- Users can SELECT traces for their own bookings
- Service role can insert and access all traces

---

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_disputes_user_id ON disputes(user_id);
CREATE INDEX idx_disputes_booking_id ON disputes(booking_id);
CREATE INDEX idx_agent_traces_booking_id ON agent_traces(booking_id);
CREATE INDEX idx_providers_city ON providers(city);
CREATE INDEX idx_providers_skill ON providers(skill);
```

---

### Migrations

#### Migration 1: Initial Schema
Run `supabase-schema.sql` to create all tables, indexes, and RLS policies.

#### Migration 2: Onboarding Column
Run `supabase-migration.sql` to add the `onboarding_completed` column:

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
```

---

*Last Updated: May 20, 2026*
