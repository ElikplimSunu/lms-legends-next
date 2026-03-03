"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Grip, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface ModulesListProps {
  items: any[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export function ModulesList({
  items,
  onReorder,
  onEdit,
}: ModulesListProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [modules, setModules] = useState(items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setModules(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedModules = items.slice(startIndex, endIndex + 1);

    setModules(items);

    const bulkUpdateData = updatedModules.map((module) => ({
      id: module.id,
      position: items.findIndex((item) => item.id === module.id),
    }));

    onReorder(bulkUpdateData);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="modules">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {modules.map((module, index) => (
              <Draggable
                key={module.id}
                draggableId={module.id}
                index={index}
              >
                {(provided) => (
                  <div
                    className={`flex items-center gap-x-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md mb-4 text-sm
                    ${module.is_published && "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-300"}
                    `}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={`px-2 py-3 border-r border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-l-md transition
                      ${module.is_published && "border-r-blue-200 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/20"}
                      `}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {module.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      <Badge
                        className={`bg-zinc-500 hover:bg-zinc-600 ${
                          module.is_published && "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {module.is_published ? "Published" : "Draft"}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(module.id)}
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
