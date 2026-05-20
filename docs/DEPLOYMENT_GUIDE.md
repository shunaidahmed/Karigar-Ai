# DEPLOYMENT_GUIDE.md

## Karigar.ai — Deployment Guide

### Prerequisites

1. Google Cloud Platform account with billing enabled
2. Supabase project
3. DeepSeek API key
4. Google Cloud SDK installed (`gcloud`)

---

### Step 1: Google Cloud Setup

```bash
# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project karigar-ai-496816

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Create Artifact Registry repository
gcloud artifacts repositories create containers \
  --repository-format=docker \
  --location=us-central1
```

---

### Step 2: Supabase Setup

1. Create a project at https://supabase.com
2. Go to SQL Editor and run `supabase-schema.sql`
3. Run `supabase-migration.sql` to add the onboarding column
4. Copy these values from Project Settings:
   - Project URL
   - anon public key
   - service_role key

---

### Step 3: Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEEPSEEK_API_KEY=your-deepseek-key
```

---

### Step 4: Build and Deploy

```bash
# Set variables
export SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2-)
export SUPABASE_ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d'=' -f2-)
export SUPABASE_SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d'=' -f2-)
export DEEPSEEK_KEY=$(grep DEEPSEEK_API_KEY .env.local | cut -d'=' -f2-)

# Build Docker image with Cloud Build
gcloud builds submit \
  --config cloudbuild.yaml \
  --project karigar-ai-496816 \
  --substitutions _NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL,_NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Deploy to Cloud Run
gcloud run deploy karigar-ai \
  --image us-central1-docker.pkg.dev/karigar-ai-496816/containers/karigar-ai:latest \
  --region us-central1 \
  --project karigar-ai-496816 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY,DEEPSEEK_API_KEY=$DEEPSEEK_KEY" \
  --cpu=2 \
  --memory=1Gi \
  --min-instances=1 \
  --max-instances=5 \
  --timeout=300
```

---

### Step 5: Seed Demo Data

```bash
curl https://your-cloud-run-url/api/seed
```

This creates 250 demo providers across 5 cities and 5 service categories.

---

### Step 6: Verify Deployment

```bash
# Check HTTP status
curl -s -o /dev/null -w "%{http_code}" https://your-cloud-run-url

# Check logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=karigar-ai" \
  --project karigar-ai-496816 \
  --limit=20
```

---

### Cloud Run Configuration

| Setting | Value |
|---|---|
| Region | us-central1 |
| CPU | 2 |
| Memory | 1Gi |
| Min Instances | 1 |
| Max Instances | 5 |
| Timeout | 300s |
| Port | 8080 |
| Authentication | Allow unauthenticated |

---

### Docker Build Configuration

The `Dockerfile` uses a multi-stage build:

1. **deps** — Install npm dependencies
2. **builder** — Build Next.js with `NEXT_PUBLIC` env vars as build args
3. **runner** — Minimal production image with standalone output

The `cloudbuild.yaml` passes `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as build args so they're baked into the client-side JavaScript.

---

### Updating the Deployment

```bash
# After making code changes:
git add -A && git commit -m "your changes" && git push

# Rebuild and redeploy:
gcloud builds submit --config cloudbuild.yaml --project karigar-ai-496816 \
  --substitutions _NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL,_NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

gcloud run deploy karigar-ai \
  --image us-central1-docker.pkg.dev/karigar-ai-496816/containers/karigar-ai:latest \
  --region us-central1 \
  --project karigar-ai-496816 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY,DEEPSEEK_API_KEY=$DEEPSEEK_KEY" \
  --cpu=2 --memory=1Gi --min-instances=1 --max-instances=5 --timeout=300
```

---

### Cost Estimate

| Service | Monthly Cost (approx) |
|---|---|
| Cloud Run (1 min instance) | ~$15-25 |
| Artifact Registry | ~$0.10 |
| Cloud Build | ~$0 (first 120 min free) |
| Supabase (Free tier) | $0 |
| DeepSeek API | ~$1-5 (depends on usage) |
| **Total** | **~$16-30/month** |

---

*Last Updated: May 20, 2026*
