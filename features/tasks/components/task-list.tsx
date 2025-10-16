"use client";

import { useMemo } from "react";
import { TaskResponse } from "@/features/tasks/types";
import { TaskListItem } from "./task-list-item";
import {
    isToday,
    isTomorrow,
    isYesterday,
    format,
    startOfDay,
    isPast,
    isSameDay,
    isWithinInterval,
    endOfDay,
    isAfter,
    isBefore
} from "date-fns";

interface TaskListProps {
    tasks: TaskResponse[];
    onTaskUpdate: (taskId: string, updatedData: TaskResponse | null) => void;
    onTaskClick: (task: TaskResponse) => void;
    /** Filter tasks by specific date or date range */
    filterDate?: Date | "today" | "tomorrow" | { start: Date; end?: Date };
    /** Show tasks without due dates */
    showNoDueDate?: boolean;
}

interface GroupedTasks {
    label: string;
    sortOrder: number;
    tasks: TaskResponse[];
}

/**
 * Filters tasks based on date criteria
 */
const filterTasksByDate = (
    tasks: TaskResponse[],
    filterDate?: Date | "today" | "tomorrow" | { start: Date; end?: Date },
    showNoDueDate: boolean = false
): TaskResponse[] => {
    if (!filterDate) {
        return tasks;
    }

    return tasks.filter((task) => {
        // Handle tasks without due dates
        if (!task.dueDate) {
            return showNoDueDate;
        }

        const taskDate = new Date(task.dueDate);

        // Handle string filters
        if (filterDate === "today") {
            return isToday(taskDate);
        }
        if (filterDate === "tomorrow") {
            return isTomorrow(taskDate);
        }

        // Handle date range filter
        if (typeof filterDate === "object" && "start" in filterDate) {
            const startDate = startOfDay(filterDate.start);

            // If end date is provided, check if task is within range
            if (filterDate.end) {
                const endDate = endOfDay(filterDate.end);
                return isWithinInterval(taskDate, { start: startDate, end: endDate });
            }

            // If no end date, show tasks from start date onwards
            return isAfter(taskDate, startDate) || isSameDay(taskDate, startDate);
        }

        // Handle specific date filter
        if (filterDate instanceof Date) {
            return isSameDay(taskDate, filterDate);
        }

        return true;
    });
};

/**
 * Groups tasks by date with smart labels
 */
const groupTasksByDate = (tasks: TaskResponse[]): GroupedTasks[] => {
    const grouped = new Map<string, GroupedTasks>();

    tasks.forEach((task) => {
        if (!task.dueDate) {
            const key = "no-date";
            if (!grouped.has(key)) {
                grouped.set(key, {
                    label: "No Due Date",
                    sortOrder: 999,
                    tasks: [],
                });
            }
            grouped.get(key)!.tasks.push(task);
            return;
        }

        const dueDate = new Date(task.dueDate);
        const dayStart = startOfDay(dueDate);
        const key = dayStart.toISOString();

        let label: string;
        let sortOrder: number;

        if (isToday(dueDate)) {
            label = "Today";
            sortOrder = 0;
        } else if (isTomorrow(dueDate)) {
            label = "Tomorrow";
            sortOrder = 1;
        } else if (isYesterday(dueDate)) {
            label = "Yesterday";
            sortOrder = -1;
        } else if (isPast(dueDate)) {
            label = format(dueDate, "MMM d");
            sortOrder = -Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        } else {
            label = format(dueDate, "MMM d");
            sortOrder = Math.floor((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) + 2;
        }

        if (!grouped.has(key)) {
            grouped.set(key, { label, sortOrder, tasks: [] });
        }
        grouped.get(key)!.tasks.push(task);
    });

    return Array.from(grouped.values())
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((group) => ({
            ...group,
            tasks: group.tasks.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }),
        }));
};

export function TaskList({
    tasks,
    onTaskUpdate,
    onTaskClick,
    filterDate,
    showNoDueDate = false
}: TaskListProps) {
    // First filter tasks, then group them
    const filteredTasks = useMemo(
        () => filterTasksByDate(tasks, filterDate, showNoDueDate),
        [tasks, filterDate, showNoDueDate]
    );

    const groupedTasks = useMemo(
        () => groupTasksByDate(filteredTasks),
        [filteredTasks]
    );

    if (filteredTasks.length === 0) {
        return (
            <div className="border border-border/40 rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="px-6 py-16 text-center">
                    <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-primary/60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <p className="text-base font-semibold text-foreground/90 mb-1">
                        {filterDate ? "No tasks found" : "All clear!"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {filterDate
                            ? "No tasks match your filter criteria."
                            : "You have no tasks. Enjoy the peace and quiet."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {groupedTasks.map((group) => (
                <div key={group.label} className="group/section">
                    {/* Date Group Header */}
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-[13px] font-bold text-foreground/90 tracking-tight uppercase">
                                {group.label}
                            </h2>
                            <span className="text-[11px] font-medium text-muted-foreground/60">
                                {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'}
                            </span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-border/60 via-border/30 to-transparent" />
                    </div>

                    {/* Tasks Container */}
                    <div className="border border-border/40 rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                        {group.tasks.map((task) => (
                            <TaskListItem
                                key={task.id}
                                task={task}
                                onTaskUpdate={(updatedData) => onTaskUpdate(task.id, updatedData)}
                                onTaskClick={onTaskClick}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
