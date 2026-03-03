"use client";

import { VideoPlayer } from "@/components/lessons/video-player";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Download, ChevronRight } from "lucide-react";
import { saveLessonProgressAction, markLessonCompleteAction } from "@/actions/progress";
import { useRouter } from "next/navigation";
import { useState, useCallback, useTransition } from "react";
import { toast } from "sonner";

interface LessonPlayerProps {
  lesson: unknown;
  courseSlug: string;
  courseId: string;
  isEnrolled: boolean;
  initialPosition: number;
  isCompleted: boolean;
  playbackToken?: string;
  nextLessonId?: string;
  attachments: unknown[];
}

export function LessonPlayer({
  lesson,
  courseSlug,
  courseId,
  isEnrolled,
  initialPosition,
  isCompleted,
  playbackToken,
  nextLessonId,
  attachments,
}: LessonPlayerProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(isCompleted);
  const [isPending, startTransition] = useTransition();

  const handleProgressSave = useCallback(
    (lessonId: string, position: number) => {
      saveLessonProgressAction(lessonId, {
        last_position_seconds: position,
        watch_time_seconds: position,
      });
    },
    []
  );

  const handleComplete = useCallback(
    (lessonId: string) => {
      if (completed) return;
      startTransition(async () => {
        const result = await markLessonCompleteAction(lessonId);
        if (result.success) {
          setCompleted(true);
          toast.success("Lesson completed!");
          router.refresh();
        }
      });
    },
    [completed, router]
  );

  const handleManualComplete = () => {
    handleComplete(lesson.id);
  };

  const goToNextLesson = () => {
    if (nextLessonId) {
      router.push(`/learn/${courseSlug}/lessons/${nextLessonId}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Video Player */}
      {lesson.mux_playback_id && (
        <VideoPlayer
          playbackId={lesson.mux_playback_id}
          playbackToken={playbackToken}
          courseId={courseId}
          lessonId={lesson.id}
          initialPosition={initialPosition}
          onProgressSave={isEnrolled ? handleProgressSave : undefined}
          onComplete={isEnrolled ? handleComplete : undefined}
        />
      )}

      {/* Lesson Info Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {(lesson.modules as unknown)?.title}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEnrolled && (
            <Button
              variant={completed ? "outline" : "default"}
              size="sm"
              onClick={handleManualComplete}
              disabled={completed || isPending}
              className={completed ? "text-emerald-600 border-emerald-200" : ""}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {completed ? "Completed" : "Mark Complete"}
            </Button>
          )}
          {nextLessonId && (
            <Button variant="ghost" size="sm" onClick={goToNextLesson}>
              Next Lesson
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Lesson Content (Markdown) */}
      {lesson.content_markdown && (
        <div className="prose dark:prose-invert max-w-none bg-card text-card-foreground border border-border dark:border-border rounded-xl p-6">
          <div dangerouslySetInnerHTML={{ __html: lesson.content_markdown }} />
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="bg-card text-card-foreground border border-border dark:border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Attachments</h3>
          <div className="space-y-2">
            {attachments.map((file: unknown) => (
              <a
                key={file.id}
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 dark:hover:bg-zinc-900 transition border border-border dark:border-border"
              >
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.file_type}
                    {file.file_size_bytes && ` · ${(file.file_size_bytes / 1024).toFixed(0)} KB`}
                  </p>
                </div>
                <Download className="w-4 h-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
