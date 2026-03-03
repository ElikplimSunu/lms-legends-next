"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { startQuizAttemptAction, submitQuizAttemptAction } from "@/actions/quizzes";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface QuizFormProps {
  quizId: string;
  quizTitle: string;
  passingScore: number;
  maxAttempts: number;
  previousAttempts: number;
}

type QuizState = "idle" | "in_progress" | "submitted";

interface QuizAttemptData {
  attempt: { id: string };
  timeLimit?: number;
  questions: Array<{ id: string; question_type: string; question_text: string }>;
  options: Array<{ id: string; question_id: string; option_text: string }>;
}

interface QuizResultData {
  passed: boolean;
  scorePercent: number;
  earnedPoints: number;
  totalPoints: number;
}

export function QuizForm({
  quizId,
  quizTitle,
  passingScore,
  maxAttempts,
  previousAttempts,
}: QuizFormProps) {
  const [state, setState] = useState<QuizState>("idle");
  const [attemptData, setAttemptData] = useState<QuizAttemptData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [results, setResults] = useState<QuizResultData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const attemptsRemaining = maxAttempts - previousAttempts;

  const handleSubmit = useCallback(() => {
    if (!attemptData) return;
    startTransition(async () => {
      const answers = attemptData.questions.map((q) => ({
        questionId: q.id,
        selectedOptionIds: selectedAnswers[q.id] || [],
      }));

      const result = await submitQuizAttemptAction(attemptData.attempt.id, answers);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setResults(result.data as QuizResultData);
      setState("submitted");
    });
  }, [attemptData, selectedAnswers]);

  // Timer
  useEffect(() => {
    if (state !== "in_progress" || !timeLeft) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => (t !== null ? t - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [state, timeLeft, handleSubmit]);

  const handleStart = () => {
    startTransition(async () => {
      const result = await startQuizAttemptAction(quizId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setAttemptData(result.data as QuizAttemptData);
      if ((result.data as QuizAttemptData).timeLimit) {
        setTimeLeft((result.data as QuizAttemptData).timeLimit! * 60);
      }
      setState("in_progress");
    });
  };

  const handleOptionSelect = (questionId: string, optionId: string, isMultiple: boolean) => {
    setSelectedAnswers((prev) => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        return {
          ...prev,
          [questionId]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Idle State ──
  if (state === "idle") {
    return (
      <div className="text-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">{quizTitle}</h2>
        <p className="text-muted-foreground">
          Passing score: {passingScore}% · Attempts remaining: {attemptsRemaining}
        </p>
        {attemptsRemaining <= 0 ? (
          <div className="flex items-center gap-2 justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            <span>No attempts remaining</span>
          </div>
        ) : (
          <Button size="lg" onClick={handleStart} disabled={isPending}>
            {isPending ? "Starting..." : "Start Quiz"}
          </Button>
        )}
      </div>
    );
  }

  // ── Results State ──
  if (state === "submitted" && results) {
    return (
      <div className="max-w-2xl mx-auto p-8 space-y-6 text-center">
        {results.passed ? (
          <div className="space-y-2">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-3xl font-bold text-emerald-600">You Passed!</h2>
          </div>
        ) : (
          <div className="space-y-2">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-3xl font-bold text-red-600">Not Quite</h2>
          </div>
        )}
        <div className="text-5xl font-bold">{results.scorePercent.toFixed(0)}%</div>
        <p className="text-muted-foreground">
          {results.earnedPoints} / {results.totalPoints} points · Passing: {passingScore}%
        </p>
        {!results.passed && attemptsRemaining > 1 && (
          <Button
            onClick={() => {
              setState("idle");
              setSelectedAnswers({});
              setResults(null);
              setAttemptData(null);
            }}
          >
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // ── In Progress State ──
  const questions = attemptData?.questions || [];
  const options = attemptData?.options || [];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Timer */}
      {timeLeft !== null && (
        <div
          className={`flex items-center gap-2 justify-center text-lg font-mono font-bold ${
            timeLeft < 60 ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      )}

      {/* Questions */}
      {questions.map((question, idx: number) => {
        const questionOptions = options.filter((o) => o.question_id === question.id);
        const isMultiple = question.question_type === "multiple_choice";
        const selected = selectedAnswers[question.id] || [];

        return (
          <div
            key={question.id}
            className="border border-border dark:border-border rounded-xl p-6 space-y-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold bg-muted dark:bg-muted px-2 py-1 rounded">
                Q{idx + 1}
              </span>
              <div>
                <p className="font-medium">{question.question_text}</p>
                {isMultiple && (
                  <p className="text-xs text-muted-foreground mt-1">Select all that apply</p>
                )}
              </div>
            </div>
            <div className="space-y-2 pl-8">
              {questionOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionSelect(question.id, option.id, isMultiple)}
                  className={`w-full text-left p-3 rounded-lg border transition text-sm ${
                    selected.includes(option.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-primary/20/20 text-primary-foreground dark:text-blue-300"
                      : "border-border dark:border-border hover:bg-muted/50 dark:hover:bg-zinc-900"
                  }`}
                >
                  {option.option_text}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Submit */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Grading..." : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
}
