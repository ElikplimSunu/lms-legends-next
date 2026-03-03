"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types";

// ── Instructor: Create Quiz ──
export async function createQuizAction(
    moduleId: string,
    data: { title: string; description?: string; passing_score_percent?: number; time_limit_minutes?: number; max_attempts?: number; is_certification_exam?: boolean }
): Promise<ActionResult<any>> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Verify ownership
    const { data: module } = await supabase
        .from("modules")
        .select("course_id, courses!inner(instructor_id)")
        .eq("id", moduleId)
        .single();

    if (!module || (module as any).courses.instructor_id !== user.id) {
        return { success: false, error: "Unauthorized" };
    }

    const { data: quiz, error } = await supabase
        .from("quizzes")
        .insert({
            module_id: moduleId,
            title: data.title,
            description: data.description || null,
            passing_score_percent: data.passing_score_percent ?? 70,
            time_limit_minutes: data.time_limit_minutes ?? null,
            max_attempts: data.max_attempts ?? 3,
            is_certification_exam: data.is_certification_exam ?? false,
        })
        .select()
        .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(`/dashboard/instructor/courses`);
    return { success: true, data: quiz };
}

// ── Instructor: Add Question ──
export async function addQuestionAction(
    quizId: string,
    data: {
        question_text: string;
        question_type: string;
        points?: number;
        explanation?: string;
        options: { option_text: string; is_correct: boolean }[];
    }
): Promise<ActionResult<any>> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Get max sort_order
    const { data: existing } = await supabase
        .from("quiz_questions")
        .select("sort_order")
        .eq("quiz_id", quizId)
        .order("sort_order", { ascending: false })
        .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data: question, error } = await supabase
        .from("quiz_questions")
        .insert({
            quiz_id: quizId,
            question_text: data.question_text,
            question_type: data.question_type || "single_choice",
            points: data.points ?? 1,
            explanation: data.explanation || null,
            sort_order: nextOrder,
        })
        .select()
        .single();

    if (error) return { success: false, error: error.message };

    // Insert options
    if (data.options.length > 0) {
        const { error: optionsError } = await supabase.from("quiz_options").insert(
            data.options.map((opt, idx) => ({
                question_id: question.id,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                sort_order: idx,
            }))
        );
        if (optionsError) return { success: false, error: optionsError.message };
    }

    revalidatePath(`/dashboard/instructor`);
    return { success: true, data: question };
}

// ── Instructor: Delete Question ──
export async function deleteQuestionAction(questionId: string): Promise<ActionResult> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);
    if (error) return { success: false, error: error.message };

    return { success: true, data: undefined };
}

// ── Student: Start Quiz Attempt ──
export async function startQuizAttemptAction(quizId: string): Promise<ActionResult<any>> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Check max attempts
    const { count } = await supabase
        .from("quiz_attempts")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", quizId)
        .eq("user_id", user.id);

    const { data: quiz } = await supabase
        .from("quizzes")
        .select("max_attempts, time_limit_minutes, shuffle_questions")
        .eq("id", quizId)
        .single();

    if (!quiz) return { success: false, error: "Quiz not found" };
    if (count !== null && count >= (quiz.max_attempts ?? 3)) {
        return { success: false, error: "Maximum attempts reached" };
    }

    // Create attempt
    const { data: attempt, error } = await supabase
        .from("quiz_attempts")
        .insert({
            quiz_id: quizId,
            user_id: user.id,
            status: "in_progress",
        })
        .select()
        .single();

    if (error) return { success: false, error: error.message };

    // Fetch questions WITHOUT correct answers (via public view or select)
    const { data: questions } = await supabase
        .from("quiz_questions")
        .select("id, question_type, question_text, points, sort_order")
        .eq("quiz_id", quizId)
        .order("sort_order");

    const questionIds = (questions || []).map((q: any) => q.id);

    // Get options (without is_correct)
    const { data: options } = await supabase
        .from("quiz_options")
        .select("id, question_id, option_text, sort_order")
        .in("question_id", questionIds)
        .order("sort_order");

    return {
        success: true,
        data: {
            attempt,
            questions: questions || [],
            options: options || [],
            timeLimit: quiz.time_limit_minutes,
        },
    };
}

// ── Student: Submit Quiz Attempt ──
export async function submitQuizAttemptAction(
    attemptId: string,
    answers: { questionId: string; selectedOptionIds: string[]; textAnswer?: string }[]
): Promise<ActionResult<any>> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Verify attempt
    const { data: attempt } = await supabase
        .from("quiz_attempts")
        .select("*, quizzes(*)")
        .eq("id", attemptId)
        .eq("user_id", user.id)
        .eq("status", "in_progress")
        .single();

    if (!attempt) return { success: false, error: "Invalid attempt" };

    // Check time limit
    const quiz = (attempt as any).quizzes;
    if (quiz.time_limit_minutes) {
        const elapsed = (Date.now() - new Date(attempt.started_at).getTime()) / 60000;
        if (elapsed > quiz.time_limit_minutes + 0.5) {
            return { success: false, error: "Time limit exceeded" };
        }
    }

    // Save answers
    if (answers.length > 0) {
        await supabase.from("quiz_answers").insert(
            answers.map((a) => ({
                attempt_id: attemptId,
                question_id: a.questionId,
                selected_option_ids: a.selectedOptionIds,
                text_answer: a.textAnswer || null,
            }))
        );
    }

    // Mark submitted
    await supabase
        .from("quiz_attempts")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", attemptId);

    // Grade — use service role to read is_correct
    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const savedAnswers = await adminClient
        .from("quiz_answers")
        .select("*, quiz_questions!inner(points, question_type)")
        .eq("attempt_id", attemptId);

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const answer of savedAnswers.data || []) {
        const qPoints = (answer as any).quiz_questions.points;
        totalPoints += qPoints;

        const { data: correctOptions } = await adminClient
            .from("quiz_options")
            .select("id")
            .eq("question_id", answer.question_id)
            .eq("is_correct", true);

        const correctIds = new Set((correctOptions || []).map((o: any) => o.id));
        const selectedIds = new Set(answer.selected_option_ids || []);

        const isCorrect =
            correctIds.size === selectedIds.size &&
            [...correctIds].every((id) => selectedIds.has(id));

        earnedPoints += isCorrect ? qPoints : 0;

        await adminClient
            .from("quiz_answers")
            .update({ is_correct: isCorrect, points_earned: isCorrect ? qPoints : 0 })
            .eq("id", answer.id);
    }

    const scorePercent = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = scorePercent >= quiz.passing_score_percent;

    await adminClient
        .from("quiz_attempts")
        .update({
            status: "graded",
            score_percent: scorePercent,
            total_points: totalPoints,
            earned_points: earnedPoints,
            passed,
            graded_at: new Date().toISOString(),
        })
        .eq("id", attemptId);

    return {
        success: true,
        data: { scorePercent, passed, earnedPoints, totalPoints },
    };
}
