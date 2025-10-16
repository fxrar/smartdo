"use client";

import { useState } from "react";
import { TaskResponse } from "@/features/tasks/types";
import { toggleTaskDone } from "./actions";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

// Shadcn UI Components & Icons
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarIcon, PencilIcon, TrashIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";

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

  if (diffInHours < 0) return "text-destructive";
  if (diffInHours < 24) return "text-orange-500";
  if (diffInHours < 48) return "text-yellow-600";
  return "text-muted-foreground";
};

const getSmartDueText = (dueDate: string) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffInDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return `Overdue by ${Math.abs(diffInDays)} day${Math.abs(diffInDays) === 1 ? '' : 's'}`;
  }
  if (diffInDays === 0) return "Due today";
  if (diffInDays === 1) return "Due tomorrow";
  return `Due in ${diffInDays} days`;
};

const triggerConfetti = () => {
  const count = 100;
  const defaults = { origin: { y: 0.7 } };

  confetti({ ...defaults, particleCount: count * 0.25, spread: 26, startVelocity: 55 });
  confetti({ ...defaults, particleCount: count * 0.2, spread: 60 });
  confetti({ ...defaults, particleCount: count * 0.35, spread: 100, decay: 0.91, scalar: 0.8 });
  confetti({ ...defaults, particleCount: count * 0.1, spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
};

export function TaskListItem({ task, onTaskClick, onTaskUpdate }: TaskListItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [optimisticDone, setOptimisticDone] = useState(task.done);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !optimisticDone;
  const isShortDescription = task.description && task.description.length <= 70;
  const dueDateColor = task.dueDate ? getDueDateColor(task.dueDate, optimisticDone) : "";

  const handleToggleComplete = async (checked: boolean) => {
    if (isLoading) return;
    const previousDoneState = optimisticDone;
    setOptimisticDone(checked);

    if (checked) {
      triggerConfetti();
    }

    setIsLoading(true);
    try {
      const updatedTask = await toggleTaskDone(task.id, checked);
      setOptimisticDone(updatedTask.done);
      onTaskUpdate?.(updatedTask);
    } catch (error) {
      console.error("Failed to toggle task:", error);
      setOptimisticDone(previousDoneState);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskDeleted = () => {
    setIsDeleteModalOpen(false);
    onTaskUpdate?.(null);
  };

  const handleItemClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!event.target.closest('button, [role="checkbox"], a, [role="menuitem"]')) {
      onTaskClick?.(task);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.key === "Enter" || event.key === " ") && onTaskClick) {
      if (!event.target.closest('[role="checkbox"], [role="button"]')) {
        event.preventDefault();
        onTaskClick(task);
      }
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.2 }}
        role="listitem"
        aria-label={`Task: ${task.title}`}
        className={cn(
          "group relative flex items-start gap-3  order/40 bg-transparent px-4 py-3.5",
          "transition-all duration-200 ease-out",
          "hover:bg-accent/50 hover:order",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-accent/50",
          onTaskClick ? "cursor-pointer" : ""
        )}
        onClick={handleItemClick}
        onKeyDown={handleKeyDown}
        tabIndex={onTaskClick ? 0 : -1}
      >
        {/* Checkbox with Loading Spinner */}
        <div className="relative flex-shrink-0 pt-0.5">
          <Checkbox
            id={`task-${task.id}`}
            checked={optimisticDone}
            onCheckedChange={handleToggleComplete}
            disabled={isLoading}
            aria-label={optimisticDone ? "Mark as not complete" : "Mark as complete"}
            className={cn(
              "h-[18px] w-[18px] rounded-md border-2 transition-all duration-200",
              isLoading && "opacity-40"
            )}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <motion.h3
            animate={{
              textDecoration: optimisticDone ? "line-through" : "none",
              opacity: optimisticDone ? 0.5 : 1
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "text-[15px] font-medium leading-snug tracking-tight",
              optimisticDone ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {task.title}
          </motion.h3>

          {/* Due Date & Description Row */}
          {(task.dueDate || isShortDescription) && (
            <div className="flex items-center gap-2 text-xs">
              {task.dueDate && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md cursor-help",
                        "transition-colors duration-200",
                        dueDateColor,
                        "bg-accent/30 hover:bg-accent/50"
                      )}
                    >
                      <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="font-medium text-[11px]">{getSmartDueText(task.dueDate)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}

              {task.dueDate && isShortDescription && (
                <span className="hidden group-hover:inline text-muted-foreground/40">•</span>
              )}

              {isShortDescription && (
                <p className="hidden group-hover:block text-muted-foreground/70 truncate text-[11px]" title={task.description}>
                  {task.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">Edit Task</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>Edit (coming soon)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Delete Task</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>Delete Task</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem disabled className="text-xs">
                  <PencilIcon className="mr-2 h-3.5 w-3.5" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-destructive focus:text-destructive text-xs"
                >
                  <TrashIcon className="mr-2 h-3.5 w-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      <DeleteTask
        task={task}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onTaskDeleted={handleTaskDeleted}
      />
    </TooltipProvider>
  );
}

export function TaskListItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <Skeleton className="h-[18px] w-[18px] rounded-md flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[65%]" />
        <Skeleton className="h-3 w-[35%]" />
      </div>
    </div>
  );
}
