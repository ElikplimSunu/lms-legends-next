import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId: string;
  courseId: string;
  lessonId: string;
  nextLessonId?: string;
  isLocked?: boolean;
}

export function VideoPlayer({
  playbackId,
  courseId,
  lessonId,
  nextLessonId,
  isLocked,
}: VideoPlayerProps) {
  if (isLocked) {
    return (
      <div className="flex bg-zinc-950 text-white flex-col gap-y-2 items-center justify-center aspect-video rounded-md border border-zinc-800">
        <p className="text-sm font-medium">This chapter is locked.</p>
        <p className="text-xs text-zinc-400">Please enroll in the course to view.</p>
      </div>
    );
  }

  // TODO: We need to sign this playbackId if the policy is "signed"
  // For now, we will assume "public" or signed via a separate server action mechanism if strictly enforced.
  // We'll scaffold the player first and wire signing based on environment variable presence.

  return (
    <div className="relative aspect-video rounded-md overflow-hidden bg-zinc-950">
      <MuxPlayer
        playbackId={playbackId}
        className="w-full h-full"
        // tokens={{
        //   playback: signedToken, // If we strictly use signed policies
        // }}
        onEnded={() => {
           // We can mark the lesson as completed here
        }}
      />
    </div>
  );
}
