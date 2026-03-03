# LMS Legends — Project Specification Document

> **Version:** 1.0  
> **Date:** March 3, 2026  
> **Tech Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase · Mux · Stripe Connect · Resend

## Table of Contents

| # | Section | File |
|---|---|---|
| 1 | [System Architecture](./01-system-architecture.md) | Communication patterns, data fetching strategy, auth/RBAC, caching |
| 2 | [Database Schema](./02-database-schema.md) | ER diagram, full SQL DDL (15+ tables), RLS policies, TypeScript interfaces |
| 3 | [Routing & File Structure](./03-routing-file-structure.md) | Next.js App Router directory tree, route protection strategy |
| 4 | [Video Streaming Workflow](./04-video-streaming-workflow.md) | Upload flow (Mux Direct Upload), playback flow (signed HLS), security |
| 5 | [Quiz & Certification Logic](./05-quiz-certification-logic.md) | Anti-cheating measures, server-side grading, PDF certificate generation |
| 6 | [Milestones & Phased Rollout](./06-milestones-phased-rollout.md) | 8-phase plan from setup to launch (~13 weeks) |

## Project Overview

LMS Legends is a multi-sided e-learning marketplace where **experts** create and sell video courses, and **students** purchase access, consume lessons, take quizzes, and earn certificates.

### User Roles

| Role | Capabilities |
|---|---|
| **Student** | Browse catalog, purchase courses, stream video lessons, track progress, take quizzes, earn PDF certificates |
| **Instructor** | Create courses with modules/lessons, upload video via Mux, build quizzes, view revenue & payouts |
| **Admin** | Moderate content, approve instructor applications, manage categories, oversee platform finances |

### Third-Party Integration Map

```
┌──────────┬────────────────────────────────────────────┐
│ Service  │ Purpose                                    │
├──────────┼────────────────────────────────────────────┤
│ Supabase │ PostgreSQL DB, Auth, RLS, Storage, Realtime│
│ Mux      │ Video upload, transcoding, HLS streaming   │
│ Stripe   │ Checkout, Connect payouts, refunds         │
│ Resend   │ Transactional emails (receipts, certs)     │
│ Vercel   │ Hosting, Edge Functions, CI/CD             │
└──────────┴────────────────────────────────────────────┘
```
