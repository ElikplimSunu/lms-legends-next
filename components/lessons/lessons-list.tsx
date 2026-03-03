"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Grip, Pencil, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface LessonsListProps {
  items: unknown[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export function LessonsList({
  items,
  onReorder,
  onEdit,
}: LessonsListProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [lessons, setLessons] = useState(items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setLessons(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedLessons = items.slice(startIndex, endIndex + 1);

    setLessons(items);

    const bulkUpdateData = updatedLessons.map((lesson) => ({
      id: lesson.id,
      position: items.findIndex((item) => item.id === lesson.id),
    }));

    onReorder(bulkUpdateData);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lessons">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {lessons.map((lesson, index) => (
              <Draggable
                key={lesson.id}
                draggableId={lesson.id}
                index={index}
              >
                {(provided) => (
                  <div
                    className={`flex items-center gap-x-2 bg-muted dark:bg-muted border border-border dark:border-border text-foreground dark:text-muted-foreground rounded-md mb-4 text-sm
                    `}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={`px-2 py-3 border-r border-border dark:border-border hover:bg-secondary dark:hover:bg-zinc-800 rounded-l-md transition
                      `}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {lesson.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      {lesson.is_free_preview && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30">
                          Free
                        </Badge>
                      )}
                      {lesson.mux_playback_id && (
                        <Video className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Badge
                        className="bg-muted/500 hover:bg-zinc-600"
                      >
                        Lesson
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(lesson.id)}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
