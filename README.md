# Renove AI

SaaS web B2C pour redesigner une pièce avec l'IA. Prends une photo, choisis un style, reçois un rendu redesigné.

## Stack

- Next.js 14 (App Router)
- Supabase (auth + database + storage)
- Stripe (subscriptions)
- Kie.ai Nano Banana 2 (image generation)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.local.example .env.local
```

3. Run the SQL schema in Supabase (`supabase/schema.sql`)

4. Create storage buckets `originals` and `generated` in Supabase

5. Configure Google OAuth in Supabase dashboard

6. Create Stripe products/prices and add Price IDs to `.env.local`

7. Start dev server:

```bash
npm run dev
```

## Stripe Webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/upload` | Photo upload + style selection |
| `/loading` | AI generation loading |
| `/preview` | Blurred preview (paywall) |
| `/pricing` | Subscription plans |
| `/auth/signup` | Account creation |
| `/auth/login` | Login |
| `/dashboard` | User dashboard |
| `/dashboard/creations` | Gallery |
| `/dashboard/account` | Account settings |

## Deploy

Deploy on Vercel with all environment variables from `.env.local`.
