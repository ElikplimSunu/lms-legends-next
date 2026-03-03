# LMS Legends — System Architecture

## 1. High-Level Overview

LMS Legends is a multi-sided e-learning marketplace built on **Next.js 16 (App Router)** with **Supabase** as the backend, **Mux** for video infrastructure, **Stripe Connect** for payments, and **Resend** for transactional email.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                  │
│   Browser (RSC + Client Components)  │  Mobile (Future API)    │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────────────┐
│                 NEXT.JS APP (Vercel Edge)                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Server       │  │ Server       │  │ Route Handlers        │  │
│  │ Components   │  │ Actions      │  │ (API / Webhooks)      │  │
│  │ (data fetch) │  │ (mutations)  │  │ /api/webhooks/*       │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                      │               │
│  ┌──────▼─────────────────▼──────────────────────▼───────────┐  │
│  │              Shared Service Layer (lib/)                    │  │
│  │  supabase.ts │ mux.ts │ stripe.ts │ resend.ts │ auth.ts   │  │
│  └──────┬───────────┬────────┬──────────┬────────────────────┘  │
└─────────┼───────────┼────────┼──────────┼────────────────────────┘
          │           │        │          │
    ┌─────▼───┐ ┌─────▼──┐ ┌──▼────┐ ┌───▼────┐
    │Supabase │ │  Mux   │ │Stripe │ │ Resend │
    │ (PG+Auth│ │  API   │ │Connect│ │  API   │
    │ +Storage│ │        │ │       │ │        │
    └─────────┘ └────────┘ └───────┘ └────────┘
```

## 2. Communication Patterns

### 2.1 Supabase

| Context | Method | Example |
|---|---|---|
| Server Component (read) | `createServerClient()` from `@supabase/ssr` | Fetching course catalog, lesson data |
| Server Action (write) | `createServerClient()` with cookie handling | Creating courses, enrolling students |
| Client Component (realtime) | `createBrowserClient()` from `@supabase/ssr` | Live chat, presence indicators |
| Route Handler (webhook) | `createClient()` (service role key) | Stripe/Mux webhook processing |

**Key Principle:** All reads happen in Server Components (zero client JS). Client Components are used **only** when browser APIs are required (video player, file upload, interactive quizzes).

### 2.2 Mux

| Operation | Where | How |
|---|---|---|
| Create Upload URL | Server Action | `POST /api/mux/upload` → Mux Direct Upload API |
| Upload Video | Client Component | Mux Uploader SDK (`@mux/mux-uploader-react`) |
| Webhook (asset.ready) | Route Handler | `POST /api/webhooks/mux` verifies signature → updates `lessons.mux_asset_status` |
| Stream Playback | Client Component | `<MuxPlayer>` with signed playback token (generated server-side) |

### 2.3 Stripe Connect

| Operation | Where | How |
|---|---|---|
| Instructor Onboarding | Server Action | Creates Connected Account → returns `accountLink.url` |
| Course Purchase | Server Action | Creates Checkout Session with `payment_intent_data.transfer_data` |
| Payout / Revenue Split | Webhook Handler | `checkout.session.completed` → creates `Transfer` to connected account |
| Refunds | Admin Server Action | `POST /api/admin/refunds` → Stripe Refund API + reversal |

### 2.4 Resend

All emails are triggered from Server Actions or webhook handlers:

- **Welcome email** → on `auth.users` insert (Supabase trigger → Edge Function → Resend)
- **Purchase receipt** → on `checkout.session.completed` webhook
- **Certificate email** → on quiz pass → Server Action calls Resend with PDF attachment

## 3. Data Fetching Strategy

### Server Components (Default)

```typescript
// app/(platform)/courses/[slug]/page.tsx
export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerClient();
  const { data: course } = await supabase
    .from('courses')
    .select('*, modules(*, lessons(*))')
    .eq('slug', slug)
    .single();

  return <CourseDetail course={course} />;  // zero JS shipped for this tree
}
```

### Client Components (Interactive)

```typescript
'use client';
// components/video-player.tsx — requires browser APIs
import MuxPlayer from '@mux/mux-player-react';

export function VideoPlayer({ playbackId, token }: Props) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      tokens={{ playback: token }}
      metadata={{ video_title: 'Lesson' }}
    />
  );
}
```

### Decision Matrix

| Need | Component Type | Reason |
|---|---|---|
| Course listing / detail | Server | Static data, SEO critical |
| Video player | Client | Requires `<video>` element, Mux SDK |
| Quiz taking UI | Client | Stateful form, timers, interactivity |
| Quiz grading | Server Action | Security — prevent client-side cheating |
| File upload | Client | Requires File API, progress tracking |
| Dashboard charts | Client | Requires charting library (Recharts) |
| Certificate download | Server (streaming) | PDF generation via `@react-pdf/renderer` |

## 4. Authentication & Authorization

### Auth Flow

1. **Supabase Auth** handles sign-up, sign-in, magic link, and OAuth (Google, GitHub).
2. Middleware (`middleware.ts`) runs on every request, refreshing the session cookie.
3. Server Components read the session via `supabase.auth.getUser()`.

### Role-Based Access Control (RBAC)

```sql
-- Roles stored in public.profiles.role
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
```

**Middleware layer** (`middleware.ts`):

```typescript
// Protects route groups
const protectedRoutes = {
  '/dashboard/instructor': ['instructor', 'admin'],
  '/dashboard/admin':      ['admin'],
  '/dashboard/student':    ['student', 'instructor', 'admin'],
};
```

**Row Level Security (RLS)** on every Supabase table ensures data isolation even if application logic is bypassed.

## 5. Caching & Performance

| Layer | Strategy |
|---|---|
| Next.js ISR | Course catalog pages: `revalidate = 3600` |
| On-demand revalidation | `revalidateTag('course-{id}')` on course update |
| Supabase Edge Cache | Read-through for public course metadata |
| Mux Signed URLs | Short-lived tokens (6h TTL) for video playback |
| Stripe Sessions | Created on-demand, never cached |

## 6. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mux
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_WEBHOOK_SIGNING_SECRET=
MUX_SIGNING_KEY_ID=
MUX_SIGNING_PRIVATE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PLATFORM_FEE_PERCENT=15

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@lmslegends.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
