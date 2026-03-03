# Requirements Document

## Introduction

This document specifies the requirements for Phase 0: Project Setup & Infrastructure of the LMS Legends platform. This phase establishes the development environment, integrates third-party services (Supabase, Mux, Stripe Connect, Resend), configures CI/CD pipelines, and creates the foundational project structure. The deliverable is a fully configured, type-safe development environment ready for feature development in Phase 1.

## Glossary

- **Build_System**: The Next.js 16 build toolchain that compiles TypeScript and bundles the application
- **CI_Pipeline**: GitHub Actions workflow that performs automated testing and deployment
- **Database_Client**: The Supabase client library for database operations
- **Dev_Environment**: Local development setup including Next.js dev server and Supabase local instance
- **Email_Service**: Resend API integration for transactional email delivery
- **Migration_Runner**: Supabase migration tool that applies database schema changes
- **Payment_Processor**: Stripe Connect integration for marketplace payments
- **Project_Scaffold**: The initial Next.js project structure with configured directories and files
- **RLS_Policy**: Row Level Security policy in PostgreSQL that enforces data access rules
- **Type_Generator**: Supabase CLI tool that generates TypeScript types from database schema
- **Video_Service**: Mux API integration for video upload, encoding, and streaming
- **Webhook_Handler**: API route that receives and processes webhook events from external services

## Requirements

### Requirement 1: Initialize Next.js Project

**User Story:** As a developer, I want a Next.js 16 project with TypeScript and Tailwind CSS configured, so that I can build type-safe React applications with modern styling.

#### Acceptance Criteria

1. THE Project_Scaffold SHALL use Next.js version 16 with App Router architecture
2. THE Project_Scaffold SHALL enable TypeScript strict mode in tsconfig.json
3. THE Project_Scaffold SHALL include Tailwind CSS version 4 with default configuration
4. THE Project_Scaffold SHALL use pnpm as the package manager
5. WHEN the Build_System compiles the project, THE Build_System SHALL produce zero TypeScript errors for the initial scaffold
6. THE Project_Scaffold SHALL include a package.json with scripts for dev, build, start, and lint commands

### Requirement 2: Configure UI Component Library

**User Story:** As a developer, I want shadcn/ui components installed, so that I can build consistent interfaces quickly.

#### Acceptance Criteria

1. THE Project_Scaffold SHALL include shadcn/ui configuration in components.json
2. THE Project_Scaffold SHALL include the following components in components/ui: Button, Card, Dialog, Form, Input, Table, Tabs, Toast
3. WHEN a developer imports a shadcn component, THE Build_System SHALL resolve the import without errors
4. THE Project_Scaffold SHALL configure Tailwind CSS to support shadcn/ui styling requirements

### Requirement 3: Establish Project Directory Structure

**User Story:** As a developer, I want a well-organized directory structure, so that I can locate and organize code predictably.

#### Acceptance Criteria

1. THE Project_Scaffold SHALL include an app directory with route groups: (auth), (marketing), and (platform)
2. THE Project_Scaffold SHALL include a components directory with a ui subdirectory
3. THE Project_Scaffold SHALL include a lib directory with subdirectories: supabase, mux, stripe, and resend
4. THE Project_Scaffold SHALL include an actions directory for Server Actions
5. THE Project_Scaffold SHALL include a types directory for TypeScript interfaces
6. THE Project_Scaffold SHALL include a middleware.ts file at the project root

### Requirement 4: Create Supabase Project

**User Story:** As a developer, I want Supabase configured for local and cloud development, so that I can develop with a PostgreSQL database and authentication.

#### Acceptance Criteria

1. THE Dev_Environment SHALL include a Supabase cloud project with a unique project URL
2. THE Dev_Environment SHALL include Supabase CLI configured for local development
3. THE Database_Client SHALL connect to Supabase using environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
4. THE Database_Client SHALL support server-side operations using SUPABASE_SERVICE_ROLE_KEY
5. WHEN Supabase is initialized locally, THE Dev_Environment SHALL start PostgreSQL on port 54322 and Studio on port 54323
6. THE Type_Generator SHALL generate TypeScript types from the database schema into types/supabase.ts

### Requirement 5: Configure Row Level Security Defaults

**User Story:** As a security engineer, I want RLS enabled by default on all tables, so that data access is secure by default.

#### Acceptance Criteria

1. WHEN a new table is created, THE Migration_Runner SHALL enable Row Level Security on that table
2. THE RLS_Policy configuration SHALL deny all operations by default until explicit policies are added
3. THE Database_Client SHALL enforce RLS policies for all client-side queries using the anon key

### Requirement 6: Apply Initial Database Schema

**User Story:** As a developer, I want all database tables created from the schema spec, so that the application can store and retrieve data.

#### Acceptance Criteria

1. THE Migration_Runner SHALL create the following tables: profiles, courses, categories, modules, lessons, lesson_attachments, enrollments, lesson_progress, quizzes, quiz_questions, quiz_options, quiz_attempts, quiz_answers, certificates, reviews, payouts
2. WHEN the initial migration runs, THE Migration_Runner SHALL complete without errors
3. WHEN the Type_Generator runs after migration, THE Type_Generator SHALL produce TypeScript interfaces for all tables
4. THE Migration_Runner SHALL create all foreign key constraints defined in the schema spec
5. THE Migration_Runner SHALL create all indexes defined in the schema spec

### Requirement 7: Integrate Mux Video Service

**User Story:** As a developer, I want Mux configured for video operations, so that instructors can upload and stream course videos.

#### Acceptance Criteria

1. THE Video_Service SHALL authenticate using MUX_TOKEN_ID and MUX_TOKEN_SECRET environment variables
2. THE Video_Service SHALL include a client library in lib/mux for creating assets and generating playback URLs
3. THE Webhook_Handler SHALL verify Mux webhook signatures using MUX_WEBHOOK_SIGNING_SECRET
4. THE Video_Service SHALL support signed URL generation using MUX_SIGNING_KEY_ID and MUX_SIGNING_PRIVATE_KEY
5. WHEN the Video_Service client is initialized, THE Video_Service SHALL validate that all required environment variables are present

### Requirement 8: Integrate Stripe Connect

**User Story:** As a developer, I want Stripe Connect configured, so that the platform can process marketplace payments with instructor payouts.

#### Acceptance Criteria

1. THE Payment_Processor SHALL authenticate using STRIPE_SECRET_KEY environment variable
2. THE Payment_Processor SHALL expose the publishable key via NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for client-side operations
3. THE Payment_Processor SHALL include a client library in lib/stripe for creating Connect accounts and processing payments
4. THE Webhook_Handler SHALL verify Stripe webhook signatures using STRIPE_WEBHOOK_SECRET
5. THE Payment_Processor SHALL apply platform fees using STRIPE_PLATFORM_FEE_PERCENT environment variable
6. WHEN the Payment_Processor client is initialized, THE Payment_Processor SHALL validate that all required environment variables are present

### Requirement 9: Integrate Resend Email Service

**User Story:** As a developer, I want Resend configured for transactional emails, so that the platform can send notifications to users.

#### Acceptance Criteria

1. THE Email_Service SHALL authenticate using RESEND_API_KEY environment variable
2. THE Email_Service SHALL send emails from the address specified in RESEND_FROM_EMAIL
3. THE Email_Service SHALL include a client library in lib/resend for sending transactional emails
4. WHEN the Email_Service client is initialized, THE Email_Service SHALL validate that all required environment variables are present
5. THE Email_Service SHALL support HTML email templates with React components

### Requirement 10: Configure Environment Variables

**User Story:** As a developer, I want environment variables documented and validated, so that I can configure the application correctly in all environments.

#### Acceptance Criteria

1. THE Project_Scaffold SHALL include a .env.example file listing all required environment variables with placeholder values
2. THE Project_Scaffold SHALL include a .env.local file in .gitignore to prevent committing secrets
3. THE Project_Scaffold SHALL include environment variable validation that runs at application startup
4. WHEN a required environment variable is missing, THE Dev_Environment SHALL log a descriptive error and prevent startup
5. THE Project_Scaffold SHALL document the following variable groups: Supabase (3 variables), Mux (5 variables), Stripe (4 variables), Resend (2 variables), App (1 variable)

### Requirement 11: Setup CI/CD Pipeline

**User Story:** As a developer, I want automated testing and deployment, so that code quality is enforced and deployments are consistent.

#### Acceptance Criteria

1. THE CI_Pipeline SHALL run on every push to main branch and on all pull requests
2. WHEN the CI_Pipeline executes, THE CI_Pipeline SHALL run linting, type-checking, and build steps in sequence
3. IF any CI step fails, THEN THE CI_Pipeline SHALL mark the workflow as failed and prevent deployment
4. WHEN all CI steps pass on main branch, THE CI_Pipeline SHALL deploy to Vercel production environment
5. THE CI_Pipeline SHALL complete within 10 minutes for a standard build
6. THE CI_Pipeline configuration SHALL be stored in .github/workflows/ci.yml

### Requirement 12: Configure Development Tooling

**User Story:** As a developer, I want code formatting and linting automated, so that code style is consistent across the team.

#### Acceptance Criteria

1. THE Project_Scaffold SHALL include Prettier configuration for code formatting
2. THE Project_Scaffold SHALL include ESLint configuration extending Next.js recommended rules
3. THE Project_Scaffold SHALL include Husky git hooks that run linting and formatting on pre-commit
4. WHEN a developer commits code, THE Dev_Environment SHALL automatically format staged files
5. THE Project_Scaffold SHALL include a script to generate Supabase TypeScript types on demand
6. THE Type_Generator SHALL run automatically after database migrations in local development

### Requirement 13: Implement Session Middleware

**User Story:** As a developer, I want session handling configured in middleware, so that authentication state is available throughout the application.

#### Acceptance Criteria

1. THE middleware.ts file SHALL initialize the Supabase client with session management
2. WHEN a request is received, THE middleware SHALL refresh the user session if needed
3. THE middleware SHALL make the session available to Server Components and Server Actions
4. THE middleware SHALL run on all routes except static assets and API routes that explicitly opt out
5. WHEN a session expires, THE middleware SHALL redirect unauthenticated users to the login page for protected routes

### Requirement 14: Validate Development Environment

**User Story:** As a developer, I want to verify that all services are connected correctly, so that I can start feature development with confidence.

#### Acceptance Criteria

1. WHEN the Dev_Environment starts, THE Dev_Environment SHALL successfully connect to Supabase
2. WHEN the Dev_Environment starts, THE Dev_Environment SHALL validate all third-party API credentials
3. THE Project_Scaffold SHALL include a health check endpoint at /api/health that verifies service connectivity
4. WHEN the health check runs, THE health check SHALL test connections to Supabase, Mux, Stripe, and Resend
5. IF any service connection fails, THEN THE health check SHALL return HTTP 503 with details about the failing service
6. WHEN all services are connected, THE health check SHALL return HTTP 200 with service status details

### Requirement 15: Document Setup Process

**User Story:** As a new developer, I want clear setup instructions, so that I can get the development environment running quickly.

#### Acceptance Criteria

1. THE Project_Scaffold SHALL include a README.md with setup instructions
2. THE README.md SHALL document prerequisites: Node.js version, pnpm installation, and required accounts
3. THE README.md SHALL provide step-by-step instructions for: cloning the repo, installing dependencies, configuring environment variables, running migrations, and starting the dev server
4. THE README.md SHALL include troubleshooting guidance for common setup issues
5. THE README.md SHALL document all available npm scripts and their purposes
