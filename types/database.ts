// ═══════════════════════════════════════════════════════
// LMS Legends — Database Entity Types
// ═══════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────
// Enum Types
// ────────────────────────────────────────────────────────

export type UserRole = "student" | "instructor" | "admin";

export type CourseStatus = "draft" | "pending_review" | "published" | "archived";

export type LessonType = "video" | "text" | "quiz";

export type MuxAssetStatus = "waiting" | "preparing" | "ready" | "errored";

export type EnrollmentStatus = "active" | "refunded" | "expired";

export type QuizAttemptStatus = "in_progress" | "submitted" | "graded";

export type QuestionType =
    | "single_choice"
    | "multiple_choice"
    | "true_false"
    | "short_answer";

export type InstructorStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "suspended";

export type PayoutStatus = "pending" | "processing" | "completed" | "failed";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// ────────────────────────────────────────────────────────
// Entity Interfaces
// ────────────────────────────────────────────────────────

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    role: UserRole;
    instructor_status: InstructorStatus | null;
    stripe_customer_id: string | null;
    stripe_connect_id: string | null;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parent_id: string | null;
    sort_order: number;
}

export interface Course {
    id: string;
    instructor_id: string;
    title: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    thumbnail_url: string | null;
    promo_video_mux_playback_id: string | null;
    price_cents: number;
    currency: string;
    status: CourseStatus;
    category_id: string | null;
    difficulty_level: DifficultyLevel | null;
    estimated_duration_minutes: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    // Relations (optional, populated via joins)
    modules?: Module[];
    instructor?: Profile;
    category?: Category;
}

export interface Module {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
    // Relations
    lessons?: Lesson[];
    quizzes?: Quiz[];
}

export interface Lesson {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    lesson_type: LessonType;
    sort_order: number;
    is_free_preview: boolean;
    mux_asset_id: string | null;
    mux_playback_id: string | null;
    mux_asset_status: MuxAssetStatus;
    video_duration_seconds: number | null;
    content_markdown: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    attachments?: LessonAttachment[];
    progress?: LessonProgress;
}

export interface LessonAttachment {
    id: string;
    lesson_id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size_bytes: number | null;
    sort_order: number;
    created_at: string;
}

export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    status: EnrollmentStatus;
    stripe_payment_intent_id: string | null;
    price_paid_cents: number;
    enrolled_at: string;
    refunded_at: string | null;
    // Relations
    course?: Course;
    user?: Profile;
}

export interface LessonProgress {
    id: string;
    user_id: string;
    lesson_id: string;
    is_completed: boolean;
    watch_time_seconds: number;
    last_position_seconds: number;
    completed_at: string | null;
    updated_at: string;
}

export interface Quiz {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    passing_score_percent: number;
    time_limit_minutes: number | null;
    max_attempts: number;
    shuffle_questions: boolean;
    is_certification_exam: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    // Relations
    questions?: QuizQuestion[];
}

export interface QuizQuestion {
    id: string;
    quiz_id: string;
    question_type: QuestionType;
    question_text: string;
    explanation: string | null;
    points: number;
    sort_order: number;
    created_at: string;
    // Relations
    options?: QuizOption[];
}

export interface QuizOption {
    id: string;
    question_id: string;
    option_text: string;
    is_correct: boolean;
    sort_order: number;
}

/** Public view — strips `is_correct` for client consumption */
export interface QuizOptionPublic {
    id: string;
    question_id: string;
    option_text: string;
    sort_order: number;
}

export interface QuizAttempt {
    id: string;
    quiz_id: string;
    user_id: string;
    status: QuizAttemptStatus;
    score_percent: number | null;
    total_points: number | null;
    earned_points: number | null;
    passed: boolean | null;
    started_at: string;
    submitted_at: string | null;
    graded_at: string | null;
    // Relations
    quiz?: Quiz;
    answers?: QuizAnswer[];
}

export interface QuizAnswer {
    id: string;
    attempt_id: string;
    question_id: string;
    selected_option_ids: string[];
    text_answer: string | null;
    is_correct: boolean | null;
    points_earned: number;
}

export interface Certificate {
    id: string;
    user_id: string;
    course_id: string;
    quiz_attempt_id: string | null;
    certificate_number: string;
    pdf_url: string | null;
    issued_at: string;
    // Relations
    course?: Course;
    user?: Profile;
}

export interface Review {
    id: string;
    user_id: string;
    course_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    user?: Profile;
}

export interface Payout {
    id: string;
    instructor_id: string;
    enrollment_id: string;
    gross_amount_cents: number;
    platform_fee_cents: number;
    net_amount_cents: number;
    stripe_transfer_id: string | null;
    status: PayoutStatus;
    created_at: string;
    completed_at: string | null;
}
