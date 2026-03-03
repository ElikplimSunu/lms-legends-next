# LMS Legends — Routing & File Structure

## Next.js App Router Directory Tree

```
lms-legends-next/
├── app/
│   ├── (auth)/                          # Auth layout (centered card, no sidebar)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── verify-email/page.tsx
│   │
│   ├── (marketing)/                     # Public marketing layout (header + footer)
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Landing / Home page
│   │   ├── courses/
│   │   │   ├── page.tsx                 # Course catalog (search, filter, sort)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx             # Course detail (syllabus, reviews, CTA)
│   │   │       └── checkout/page.tsx    # Stripe Checkout redirect
│   │   ├── categories/
│   │   │   └── [slug]/page.tsx          # Courses filtered by category
│   │   ├── instructors/
│   │   │   └── [id]/page.tsx            # Public instructor profile
│   │   ├── about/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── blog/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   │
│   ├── (platform)/                      # Authenticated platform layout (sidebar + topbar)
│   │   ├── layout.tsx                   # Auth guard, sidebar, breadcrumbs
│   │   │
│   │   ├── dashboard/                   # Student dashboard
│   │   │   ├── page.tsx                 # Overview: enrolled courses, progress
│   │   │   ├── my-courses/page.tsx      # All enrolled courses
│   │   │   ├── certificates/page.tsx    # Earned certificates list
│   │   │   └── settings/page.tsx        # Profile, password, notifications
│   │   │
│   │   ├── learn/                       # Course consumption
│   │   │   └── [courseSlug]/
│   │   │       ├── layout.tsx           # Course sidebar (modules/lessons nav)
│   │   │       ├── page.tsx             # Course overview / resume redirect
│   │   │       └── lessons/
│   │   │           └── [lessonId]/
│   │   │               ├── page.tsx     # Video player + content + attachments
│   │   │               └── quiz/page.tsx # Quiz UI linked to a lesson's module
│   │   │
│   │   ├── instructor/                  # Instructor dashboard
│   │   │   ├── layout.tsx               # Instructor role guard
│   │   │   ├── page.tsx                 # Revenue overview, recent activity
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx             # My courses list (CRUD)
│   │   │   │   ├── new/page.tsx         # Create course form
│   │   │   │   └── [courseId]/
│   │   │   │       ├── page.tsx         # Course editor: details tab
│   │   │   │       ├── modules/page.tsx # Module & lesson builder (drag-drop)
│   │   │   │       ├── quizzes/
│   │   │   │       │   ├── page.tsx     # Quiz list for this course
│   │   │   │       │   └── [quizId]/page.tsx # Quiz question editor
│   │   │   │       ├── pricing/page.tsx # Price & discounts settings
│   │   │   │       └── analytics/page.tsx # Enrollment & completion analytics
│   │   │   ├── revenue/page.tsx         # Earnings, payouts, Stripe dashboard
│   │   │   ├── students/page.tsx        # Student list & progress per course
│   │   │   └── onboarding/page.tsx      # Stripe Connect onboarding flow
│   │   │
│   │   └── admin/                       # Admin panel
│   │       ├── layout.tsx               # Admin role guard
│   │       ├── page.tsx                 # Admin dashboard (KPIs)
│   │       ├── users/page.tsx           # User management (search, ban)
│   │       ├── courses/page.tsx         # Course review queue
│   │       ├── instructors/page.tsx     # Instructor application review
│   │       ├── categories/page.tsx      # Category management
│   │       ├── payouts/page.tsx         # Platform payout oversight
│   │       └── settings/page.tsx        # Global platform settings
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── stripe/route.ts          # Stripe webhook handler
│   │   │   └── mux/route.ts             # Mux webhook handler
│   │   ├── mux/
│   │   │   └── upload-url/route.ts      # Generate Mux direct upload URL
│   │   └── certificates/
│   │       └── [id]/download/route.ts   # Stream PDF certificate
│   │
│   ├── layout.tsx                       # Root layout (providers, fonts, metadata)
│   ├── globals.css                      # Tailwind v4 base styles
│   ├── not-found.tsx
│   ├── error.tsx
│   └── loading.tsx
│
├── components/
│   ├── ui/                              # shadcn/ui primitives (auto-generated)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── marketing-header.tsx
│   │   ├── marketing-footer.tsx
│   │   └── breadcrumbs.tsx
│   ├── courses/
│   │   ├── course-card.tsx
│   │   ├── course-grid.tsx
│   │   ├── course-filters.tsx
│   │   └── course-syllabus.tsx
│   ├── lessons/
│   │   ├── video-player.tsx             # Client: MuxPlayer wrapper
│   │   ├── lesson-content.tsx
│   │   ├── lesson-sidebar.tsx
│   │   └── progress-tracker.tsx         # Client: auto-save watch position
│   ├── quizzes/
│   │   ├── quiz-form.tsx                # Client: interactive quiz taking
│   │   ├── quiz-results.tsx
│   │   ├── question-editor.tsx          # Client: instructor quiz builder
│   │   └── quiz-timer.tsx               # Client: countdown timer
│   ├── instructor/
│   │   ├── video-uploader.tsx           # Client: Mux uploader
│   │   ├── module-builder.tsx           # Client: drag-and-drop
│   │   └── revenue-chart.tsx            # Client: Recharts
│   └── shared/
│       ├── data-table.tsx
│       ├── file-upload.tsx
│       ├── rich-text-editor.tsx
│       ├── star-rating.tsx
│       └── empty-state.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts                    # createServerClient helper
│   │   ├── client.ts                    # createBrowserClient helper
│   │   ├── middleware.ts                # Supabase session refresh
│   │   └── admin.ts                     # Service role client (webhooks)
│   ├── mux/
│   │   ├── client.ts                    # Mux API client
│   │   └── tokens.ts                    # Signed playback token generation
│   ├── stripe/
│   │   ├── client.ts                    # Stripe SDK instance
│   │   ├── checkout.ts                  # Checkout session helpers
│   │   └── connect.ts                   # Connected account helpers
│   ├── resend/
│   │   └── client.ts                    # Resend client + email templates
│   ├── certificates/
│   │   └── generate-pdf.ts             # @react-pdf/renderer logic
│   └── utils.ts                         # Shared helpers (slugify, format, etc.)
│
├── actions/                             # Server Actions (use server)
│   ├── auth.ts                          # login, register, logout
│   ├── courses.ts                       # CRUD, publish, archive
│   ├── modules.ts                       # CRUD, reorder
│   ├── lessons.ts                       # CRUD, reorder, update progress
│   ├── quizzes.ts                       # CRUD questions, submit attempt, grade
│   ├── enrollments.ts                   # Purchase, verify, refund
│   ├── certificates.ts                  # Generate, retrieve
│   ├── reviews.ts                       # Create, update, delete
│   └── instructor.ts                    # Apply, onboard, get revenue
│
├── types/
│   ├── database.ts                      # Generated Supabase types
│   ├── supabase.ts                      # Supabase client type overrides
│   └── index.ts                         # Shared app-level types
│
├── hooks/
│   ├── use-user.ts
│   ├── use-debounce.ts
│   └── use-media-query.ts
│
├── middleware.ts                         # Root: session refresh + route protection
├── docs/spec/                           # This specification
├── supabase/
│   ├── migrations/                      # SQL migration files
│   └── seed.sql                         # Dev seed data
│
├── public/
│   ├── fonts/
│   ├── images/
│   └── og/                              # Open Graph images
│
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

## Route Protection Strategy

| Route Group | Auth Required | Roles Allowed | Guard Location |
|---|---|---|---|
| `(auth)/*` | No (redirect if authed) | All | Layout redirect |
| `(marketing)/*` | No | All | None |
| `(platform)/dashboard/*` | Yes | All authed | `(platform)/layout.tsx` |
| `(platform)/learn/*` | Yes + enrollment | All authed | Page-level check |
| `(platform)/instructor/*` | Yes | `instructor`, `admin` | `instructor/layout.tsx` |
| `(platform)/admin/*` | Yes | `admin` only | `admin/layout.tsx` |
