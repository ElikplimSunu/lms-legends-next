// Re-export all database types
export type {
    UserRole,
    CourseStatus,
    LessonType,
    MuxAssetStatus,
    EnrollmentStatus,
    QuizAttemptStatus,
    QuestionType,
    InstructorStatus,
    PayoutStatus,
    DifficultyLevel,
    Profile,
    Category,
    Course,
    Module,
    Lesson,
    LessonAttachment,
    Enrollment,
    LessonProgress,
    Quiz,
    QuizQuestion,
    QuizOption,
    QuizOptionPublic,
    QuizAttempt,
    QuizAnswer,
    Certificate,
    Review,
    Payout,
} from "./database";

// ────────────────────────────────────────────────────────
// App-level shared types
// ────────────────────────────────────────────────────────

/** Server Action response wrapper */
export type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };

/** Pagination params for list queries */
export interface PaginationParams {
    page: number;
    perPage: number;
}

/** Paginated response shape */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

/** Search/filter params for course catalog */
export interface CourseFilters {
    search?: string;
    categorySlug?: string;
    difficulty?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: "newest" | "popular" | "price_asc" | "price_desc" | "rating";
}
