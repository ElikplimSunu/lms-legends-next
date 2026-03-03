"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useRef, useCallback } from "react";
import { Lock } from "lucide-react";

interface VideoPlayerProps {
  playbackId: string;
  playbackToken?: string;
  courseId: string;
  lessonId: string;
  initialPosition?: number;
  isLocked?: boolean;
  onProgressSave?: (lessonId: string, position: number) => void;
  onComplete?: (lessonId: string) => void;
}

export function VideoPlayer({
  playbackId,
  playbackToken,
  courseId,
  lessonId,
  initialPosition = 0,
  isLocked,
  onProgressSave,
  onComplete,
}: VideoPlayerProps) {
  const lastSaved = useRef(0);

  const handleTimeUpdate = useCallback(
    (e: Event) => {
      const player = e.target as HTMLVideoElement;
      const current = player.currentTime;

      // Debounce: save every 30 seconds
      if (current - lastSaved.current > 30 && onProgressSave) {
        lastSaved.current = current;
        onProgressSave(lessonId, current);
      }
    },
    [lessonId, onProgressSave]
  );

  const handleEnded = useCallback(() => {
    if (onComplete) {
      onComplete(lessonId);
    }
  }, [lessonId, onComplete]);

  if (isLocked) {
    return (
      <div className="flex bg-zinc-950 text-white flex-col gap-y-2 items-center justify-center aspect-video rounded-md border border-zinc-800">
        <Lock className="w-8 h-8 text-zinc-500" />
        <p className="text-sm font-medium">This lesson is locked.</p>
        <p className="text-xs text-zinc-400">
          Please enroll in the course to view.
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-md overflow-hidden bg-zinc-950">
      <MuxPlayer
        playbackId={playbackId}
        tokens={playbackToken ? { playback: playbackToken } : undefined}
        startTime={initialPosition}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        accentColor="#6366f1"
        metadata={{ video_title: "Lesson Video" }}
      />
    </div>
  );
}
