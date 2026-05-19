-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  city text,
  area text,
  loyalty_status text default 'new' check (loyalty_status in ('new', 'returning')),
  language_preference text default 'en' check (language_preference in ('en', 'ur-rom', 'ur')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Providers table
create table public.providers (
  id text primary key,
  name text not null,
  phone text,
  skill text not null,
  specializations text[] default '{}',
  job_complexity_handled text[] default '{}',
  certifications text[] default '{}',
  city text not null,
  areas text[] default '{}',
  lat numeric,
  lng numeric,
  rating numeric default 0,
  total_reviews integer default 0,
  recent_review_date date,
  recent_review_sentiment text,
  on_time_score integer default 0,
  cancellation_rate integer default 0,
  reliability_score integer default 0,
  risk_score text default 'low' check (risk_score in ('low', 'medium', 'high')),
  dispute_count integer default 0,
  visit_fee integer default 300,
  hourly_rate_pkr integer default 1000,
  rate_per_km integer default 20,
  loyalty_discount integer default 5,
  available boolean default true,
  booked_slots timestamptz[] default '{}',
  max_daily_capacity integer default 4,
  current_day_bookings integer default 0,
  years_experience integer default 0,
  languages_spoken text[] default '{}',
  tier text default 'standard' check (tier in ('basic', 'standard', 'premium')),
  created_at timestamptz default now()
);

-- Bookings table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  provider_id text references public.providers(id),
  service_type text not null,
  issue_description text,
  severity text check (severity in ('low', 'medium', 'high')),
  location text,
  preferred_date date,
  preferred_time_window text,
  iso_time_from timestamptz,
  iso_time_to timestamptz,
  price_sensitivity text check (price_sensitivity in ('low', 'medium', 'high')),
  job_complexity text check (job_complexity in ('basic', 'intermediate', 'complex')),
  status text default 'requested' check (status in (
    'requested', 'understood', 'provider_selected', 'slot_confirmed',
    'price_approved', 'booking_confirmed', 'in_progress', 'completed',
    'closed', 'disputed', 'resolved', 'cancelled'
  )),
  total_price_pkr integer,
  price_breakdown jsonb,
  provider_earning_pkr integer,
  platform_fee_pkr integer,
  surge_applied boolean default false,
  feedback_rating integer check (feedback_rating between 1 and 5),
  feedback_comment text,
  feedback_sentiment_score numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Disputes table
create table public.disputes (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) not null,
  user_id uuid references public.profiles(id) not null,
  provider_id text references public.providers(id),
  dispute_type text not null,
  user_description text,
  dispute_severity text check (dispute_severity in ('low', 'medium', 'high')),
  likely_fault text check (likely_fault in ('user', 'provider', 'unclear')),
  recommended_action text check (recommended_action in (
    'refund', 'partial_refund', 'rebook', 'warning', 'suspend', 'escalate'
  )),
  compensation_pkr integer default 0,
  compensation_reason text,
  message_to_user text,
  message_to_provider text,
  escalate_to_human boolean default false,
  escalation_reason text,
  provider_penalty_applied boolean default false,
  penalty_details text,
  status text default 'pending' check (status in ('pending', 'resolved', 'escalated')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agent traces table
create table public.agent_traces (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id),
  user_id uuid references public.profiles(id),
  agent_id text not null,
  agent_name text not null,
  input_summary text,
  decision text,
  rationale text,
  output_summary text,
  confidence_score integer,
  fallback_triggered boolean default false,
  processing_time_ms integer,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.bookings enable row level security;
alter table public.disputes enable row level security;
alter table public.agent_traces enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Providers are publicly readable
create policy "Anyone can view providers"
  on public.providers for select using (true);

-- Bookings policies
create policy "Users can view own bookings"
  on public.bookings for select using (auth.uid() = user_id);

create policy "Users can create own bookings"
  on public.bookings for insert with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on public.bookings for update using (auth.uid() = user_id);

-- Disputes policies
create policy "Users can view own disputes"
  on public.disputes for select using (auth.uid() = user_id);

create policy "Users can create own disputes"
  on public.disputes for insert with check (auth.uid() = user_id);

create policy "Users can update own disputes"
  on public.disputes for update using (auth.uid() = user_id);

-- Agent traces policies
create policy "Users can view own agent traces"
  on public.agent_traces for select using (auth.uid() = user_id);

create policy "Users can create own agent traces"
  on public.agent_traces for insert with check (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, city)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'city');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
