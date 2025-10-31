"use client";

import { useState } from "react";
import { TaskResponse } from "@/features/tasks/types";
import { toggleTaskDone } from "./actions";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PriorityBadge } from "@/components/ui/priority-badge";

// Shadcn UI Components & Icons
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarIcon, EllipsisVerticalIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";

import { DeleteTask } from "@/components/modals/DeleteTask";

interface TaskListItemProps {
  task: TaskResponse;
  onTaskClick?: (task: TaskResponse) => void;
  onTaskUpdate?: (updatedTask: TaskResponse | null) => void;
}

const getDueDateColor = (dueDate: string, isDone: boolean) => {
  if (isDone) return "text-muted-foreground";

  const now = new Date();
  const due = new Date(dueDate);
  const diffInHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 0) return "text-red-600 dark:text-red-500";
  if (diffInHours < 24) return "text-orange-600 dark:text-orange-500";
  if (diffInHours < 48) return "text-yellow-700 dark:text-yellow-500";
  return "text-green-700 dark:text-green-500";
};

const getSmartDueText = (dueDate: string) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffInDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return `Overdue ${Math.abs(diffInDays)}d`;
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Tomorrow";
  return `${diffInDays}d`;
};

export function TaskListItem({ task, onTaskClick, onTaskUpdate }: TaskListItemProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [optimisticDone, setOptimisticDone] = useState(task.done);

  const handleToggleComplete = async (checked: boolean) => {
    const previousDoneState = optimisticDone;
    setOptimisticDone(checked);

    try {
      const updatedTask = await toggleTaskDone(task.id, checked);
      if (updatedTask.done !== checked) {
        setOptimisticDone(updatedTask.done);
      }
      onTaskUpdate?.(updatedTask);
    } catch (error) {
      console.error("Failed to toggle task:", error);
      setOptimisticDone(previousDoneState);
    }
  };

  const handleTaskDeleted = () => {
    setIsDeleteModalOpen(false);
    onTaskUpdate?.(null);
  };

  const handleItemClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!target.closest('button, [role="checkbox"], [role="menuitem"]')) {
      onTaskClick?.(task);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        role="listitem"
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 border-b",
          "transition-colors duration-150",
          "hover:bg-accent/40",
          onTaskClick ? "cursor-pointer" : ""
        )}
        onClick={handleItemClick}
      >
        <Checkbox
          id={`task-${task.id}`}
          checked={optimisticDone}
          onCheckedChange={handleToggleComplete}
          className="h-[17px] w-[17px] rounded-md flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} size="sm" />
            <motion.h3
              animate={{
                textDecoration: optimisticDone ? "line-through" : "none",
                opacity: optimisticDone ? 0.5 : 1
              }}
              className="text-[14px] font-medium leading-snug"
            >
              {task.title}
            </motion.h3>
          </div>

          {task.description && task.description.length <= 60 && (
            <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
              {task.description}
            </p>
          )}
        </div>

        {task.dueDate && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold",
            getDueDateColor(task.dueDate, optimisticDone)
          )}>
            <CalendarIcon className="h-3 w-3" />
            <span>{getSmartDueText(task.dueDate)}</span>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "h-7 w-7 flex-shrink-0 transition-opacity",
                "sm:opacity-0 sm:group-hover:opacity-100",
                "opacity-100"
              )}
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem disabled className="text-xs">
              <PencilIcon className="mr-2 h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="text-destructive focus:text-destructive text-xs"
            >
              <TrashIcon className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <DeleteTask
        task={task}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onTaskDeleted={handleTaskDeleted}
      />
    </>
  );
}

export function TaskListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="h-[17px] w-[17px] rounded-md flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <Skeleton className="h-5 w-12 rounded" />
    </div>
  );
}
