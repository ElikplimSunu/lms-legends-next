-- ═══════════════════════════════════════════════════════════════
-- LMS Legends — Initial Schema Migration
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- ENUM TYPES
-- ────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE course_status AS ENUM ('draft', 'pending_review', 'published', 'archived');
CREATE TYPE lesson_type AS ENUM ('video', 'text', 'quiz');
CREATE TYPE mux_asset_status AS ENUM ('waiting', 'preparing', 'ready', 'errored');
CREATE TYPE enrollment_status AS ENUM ('active', 'refunded', 'expired');
CREATE TYPE quiz_attempt_status AS ENUM ('in_progress', 'submitted', 'graded');
CREATE TYPE question_type AS ENUM ('single_choice', 'multiple_choice', 'true_false', 'short_answer');
CREATE TYPE instructor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ────────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  full_name             TEXT NOT NULL DEFAULT '',
  avatar_url            TEXT,
  bio                   TEXT,
  role                  user_role NOT NULL DEFAULT 'student',
  instructor_status     instructor_status,
  stripe_customer_id    TEXT UNIQUE,
  stripe_connect_id     TEXT UNIQUE,
  onboarding_completed  BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are readable"
  ON profiles FOR SELECT USING (true);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ────────────────────────────────────────────────────────────────
-- CATEGORIES
-- ────────────────────────────────────────────────────────────────

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id   UUID REFERENCES categories(id),
  sort_order  INTEGER DEFAULT 0
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT USING (true);

-- ────────────────────────────────────────────────────────────────
-- COURSES
-- ────────────────────────────────────────────────────────────────

CREATE TABLE courses (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title                         TEXT NOT NULL,
  slug                          TEXT NOT NULL UNIQUE,
  description                   TEXT,
  short_description             TEXT,
  thumbnail_url                 TEXT,
  promo_video_mux_playback_id   TEXT,
  price_cents                   INTEGER NOT NULL DEFAULT 0,
  currency                      TEXT NOT NULL DEFAULT 'usd',
  status                        course_status NOT NULL DEFAULT 'draft',
  category_id                   UUID REFERENCES categories(id),
  difficulty_level              TEXT CHECK (difficulty_level IN ('beginner','intermediate','advanced')),
  estimated_duration_minutes    INTEGER DEFAULT 0,
  published_at                  TIMESTAMPTZ,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_slug ON courses(slug);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses are publicly readable"
  ON courses FOR SELECT USING (status = 'published');

CREATE POLICY "Instructors manage own courses"
  ON courses FOR ALL USING (auth.uid() = instructor_id);

-- ────────────────────────────────────────────────────────────────
-- MODULES
-- ────────────────────────────────────────────────────────────────

CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_modules_course ON modules(course_id);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modules of published courses are readable"
  ON modules FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.status = 'published')
  );

CREATE POLICY "Instructors manage modules of own courses"
  ON modules FOR ALL USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────────
-- LESSONS
-- ────────────────────────────────────────────────────────────────

CREATE TABLE lessons (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id               UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  description             TEXT,
  lesson_type             lesson_type NOT NULL DEFAULT 'video',
  sort_order              INTEGER NOT NULL DEFAULT 0,
  is_free_preview         BOOLEAN NOT NULL DEFAULT FALSE,
  mux_asset_id            TEXT,
  mux_playback_id         TEXT,
  mux_asset_status        mux_asset_status DEFAULT 'waiting',
  video_duration_seconds  REAL,
  content_markdown        TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lessons_module ON lessons(module_id);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons readable for published courses"
  ON lessons FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id AND courses.status = 'published'
    )
  );

CREATE POLICY "Instructors manage lessons of own courses"
  ON lessons FOR ALL USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────
-- LESSON ATTACHMENTS
-- ────────────────────────────────────────────────────────────────

CREATE TABLE lesson_attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  file_name       TEXT NOT NULL,
  file_url        TEXT NOT NULL,
  file_type       TEXT NOT NULL,
  file_size_bytes INTEGER,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lesson_attachments ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────
-- ENROLLMENTS
-- ────────────────────────────────────────────────────────────────

CREATE TABLE enrollments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id                 UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status                    enrollment_status NOT NULL DEFAULT 'active',
  stripe_payment_intent_id  TEXT,
  price_paid_cents          INTEGER NOT NULL,
  enrolled_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  refunded_at               TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own enrollments"
  ON enrollments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Instructors read enrollments for own courses"
  ON enrollments FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.instructor_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────────
-- LESSON PROGRESS
-- ────────────────────────────────────────────────────────────────

CREATE TABLE lesson_progress (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id               UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed            BOOLEAN NOT NULL DEFAULT FALSE,
  watch_time_seconds      REAL DEFAULT 0,
  last_position_seconds   REAL DEFAULT 0,
  completed_at            TIMESTAMPTZ,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own progress"
  ON lesson_progress FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- QUIZZES
-- ────────────────────────────────────────────────────────────────

CREATE TABLE quizzes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id               UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  description             TEXT,
  passing_score_percent   INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes      INTEGER,
  max_attempts            INTEGER DEFAULT 3,
  shuffle_questions       BOOLEAN DEFAULT TRUE,
  is_certification_exam   BOOLEAN DEFAULT FALSE,
  sort_order              INTEGER DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────
-- QUIZ QUESTIONS & OPTIONS
-- ────────────────────────────────────────────────────────────────

CREATE TABLE quiz_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_type   question_type NOT NULL DEFAULT 'single_choice',
  question_text   TEXT NOT NULL,
  explanation     TEXT,
  points          INTEGER NOT NULL DEFAULT 1,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quiz_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text   TEXT NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

-- Public view that STRIPS is_correct (anti-cheating)
CREATE VIEW quiz_options_public AS
  SELECT id, question_id, option_text, sort_order
  FROM quiz_options;

-- ────────────────────────────────────────────────────────────────
-- QUIZ ATTEMPTS & ANSWERS
-- ────────────────────────────────────────────────────────────────

CREATE TABLE quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status          quiz_attempt_status NOT NULL DEFAULT 'in_progress',
  score_percent   REAL,
  total_points    INTEGER,
  earned_points   INTEGER,
  passed          BOOLEAN,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at    TIMESTAMPTZ,
  graded_at       TIMESTAMPTZ
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own quiz attempts"
  ON quiz_attempts FOR ALL USING (auth.uid() = user_id);

CREATE TABLE quiz_answers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id          UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id         UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_ids UUID[] DEFAULT '{}',
  text_answer         TEXT,
  is_correct          BOOLEAN,
  points_earned       INTEGER DEFAULT 0,
  UNIQUE(attempt_id, question_id)
);

ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own quiz answers"
  ON quiz_answers FOR ALL USING (
    EXISTS (SELECT 1 FROM quiz_attempts WHERE quiz_attempts.id = quiz_answers.attempt_id AND quiz_attempts.user_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────────
-- CERTIFICATES
-- ────────────────────────────────────────────────────────────────

CREATE TABLE certificates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id           UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  quiz_attempt_id     UUID REFERENCES quiz_attempts(id),
  certificate_number  TEXT NOT NULL UNIQUE,
  pdf_url             TEXT,
  issued_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own certificates"
  ON certificates FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Certificates publicly verifiable by number"
  ON certificates FOR SELECT USING (true);

-- ────────────────────────────────────────────────────────────────
-- REVIEWS
-- ────────────────────────────────────────────────────────────────

CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users manage own reviews"
  ON reviews FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- PAYOUTS
-- ────────────────────────────────────────────────────────────────

CREATE TABLE payouts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrollment_id       UUID NOT NULL REFERENCES enrollments(id),
  gross_amount_cents  INTEGER NOT NULL,
  platform_fee_cents  INTEGER NOT NULL,
  net_amount_cents    INTEGER NOT NULL,
  stripe_transfer_id  TEXT,
  status              payout_status NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors read own payouts"
  ON payouts FOR SELECT USING (auth.uid() = instructor_id);

-- ────────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON lesson_progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
