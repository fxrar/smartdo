"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskCard } from "@/features/tasks/components/task-card";
import { CreateTaskInput } from "@/features/tasks/components/create-task-input";
import { getTasks } from "@/features/tasks/components/actions";
import { TaskResponse } from "@/features/tasks/types";

type QuickFilter = "all" | "today" | "tomorrow";

export default function TasksPage() {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    const [isTaskCardOpen, setIsTaskCardOpen] = useState(false);
    const [filter, setFilter] = useState<QuickFilter>("all");

    useEffect(() => {
        let mounted = true;
        getTasks()
            .then((fetched) => {
                if (!mounted) return;
                setTasks(fetched);
            })
            .finally(() => mounted && setIsLoading(false));
        return () => {
            mounted = false;
        };
    }, []);

    const handleTaskUpdate = useCallback(
        (taskId: string, updatedData: TaskResponse | null) => {
            setTasks((current) => {
                if (updatedData) {
                    const next = current.map((t) => (t.id === taskId ? updatedData : t));
                    if (selectedTask?.id === taskId) {
                        setSelectedTask(updatedData);
                    }
                    return next;
                } else {
                    const next = current.filter((t) => t.id !== taskId);
                    if (selectedTask?.id === taskId) {
                        setIsTaskCardOpen(false);
                        setSelectedTask(null);
                    }
                    return next;
                }
            });
        },
        [selectedTask]
    );

    const handleTaskOpen = useCallback((task: TaskResponse) => {
        setSelectedTask(task);
        setIsTaskCardOpen(true);
    }, []);

    const handleTaskCreated = useCallback((newTask: TaskResponse) => {
        setTasks((current) => {
            if (current.find((t) => t.id === newTask.id)) return current;
            return [newTask, ...current];
        });
    }, []);

    const filteredTasks = useMemo(() => {
        if (filter === "all") return tasks;
        const now = new Date();
        const isSameDay = (a: Date, b: Date) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();

        return tasks.filter((t) => {
            if (!t.dueDate) return false;
            const d = new Date(t.dueDate);
            if (filter === "today") return isSameDay(d, now);
            if (filter === "tomorrow") {
                const tomorrow = new Date(now);
                tomorrow.setDate(now.getDate() + 1);
                return isSameDay(d, tomorrow);
            }
            return true;
        });
    }, [tasks, filter]);

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-baseline gap-3 mb-1">
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Tasks</h1>
                        {!isLoading && (
                            <span className="text-xs text-muted-foreground font-medium">
                                {tasks.length}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Organize and track your work
                    </p>
                </div>

                <div className="mb-4 sm:mb-6">
                    <CreateTaskInput onTaskCreated={handleTaskCreated} />
                </div>

                <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6 border-b border-border overflow-x-auto">
                    <button
                        className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${filter === "all"
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        onClick={() => setFilter("all")}
                    >
                        All
                        {filter === "all" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                        )}
                    </button>
                    <button
                        className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${filter === "today"
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        onClick={() => setFilter("today")}
                    >
                        Today
                        {filter === "today" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                        )}
                    </button>
                    <button
                        className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${filter === "tomorrow"
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        onClick={() => setFilter("tomorrow")}
                    >
                        Tomorrow
                        {filter === "tomorrow" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                        )}
                    </button>
                </div>

                {isLoading ? (
                    <LoadingSkeleton />
                ) : filteredTasks.length === 0 && filter === "all" ? (
                    <EmptyState />
                ) : filteredTasks.length === 0 ? (
                    <div className="py-12 sm:py-16 text-center">
                        <p className="text-sm text-muted-foreground">No tasks for this filter</p>
                    </div>
                ) : (
                    <TaskList
                        tasks={filteredTasks}
                        onTaskUpdate={handleTaskUpdate}
                        onTaskClick={handleTaskOpen}
                    />
                )}
            </div>

            {isTaskCardOpen && (
                <TaskCard
                    task={selectedTask}
                    open={isTaskCardOpen}
                    onOpenChange={setIsTaskCardOpen}
                    onTaskUpdate={(updatedTask) => handleTaskUpdate(updatedTask.id, updatedTask)}
                    onDelete={(id) => handleTaskUpdate(id, null)}
                />
            )}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
            </div>
            <h3 className="text-sm sm:text-base font-medium mb-1">No tasks yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-xs">
                Use the input above to create your first task
            </p>
        </div>
    );
}
