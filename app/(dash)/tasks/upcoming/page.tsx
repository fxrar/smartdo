"use client";

import { useCallback, useEffect, useState } from "react";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskCard } from "@/features/tasks/components/task-card";
import { CreateTaskInput } from "@/features/tasks/components/create-task-input";
import { getTasks } from "@/features/tasks/components/actions";
import { TaskResponse } from "@/features/tasks/types";
import { MessageSquare, X, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chat } from "@/features/ai/components/chat";
import { format, isToday, isTomorrow, isThisWeek, isAfter, startOfToday } from "date-fns";

export default function UpcomingTasksPage() {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    const [isTaskCardOpen, setIsTaskCardOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        let mounted = true;
        getTasks()
            .then((fetched) => {
                if (!mounted) return;

                // Filter upcoming tasks (today and future)
                const now = startOfToday();
                const upcomingTasks = fetched
                    .filter((task) => {
                        if (!task.dueDate) return false;
                        const dueDate = new Date(task.dueDate);
                        return isAfter(dueDate, now) || isToday(dueDate);
                    })
                    .sort((a, b) => {
                        // Sort by due date ascending
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    });

                setTasks(upcomingTasks);
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
                    // Check if updated task is still upcoming
                    const now = startOfToday();
                    if (updatedData.dueDate) {
                        const dueDate = new Date(updatedData.dueDate);
                        const isUpcoming = isAfter(dueDate, now) || isToday(dueDate);

                        if (!isUpcoming) {
                            // Remove from list if no longer upcoming
                            const next = current.filter((t) => t.id !== taskId);
                            if (selectedTask?.id === taskId) {
                                setIsTaskCardOpen(false);
                                setSelectedTask(null);
                            }
                            return next;
                        }
                    }

                    const next = current
                        .map((t) => (t.id === taskId ? updatedData : t))
                        .sort((a, b) => {
                            if (!a.dueDate) return 1;
                            if (!b.dueDate) return -1;
                            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                        });
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
        // Only add if it's upcoming
        if (newTask.dueDate) {
            const now = startOfToday();
            const dueDate = new Date(newTask.dueDate);
            const isUpcoming = isAfter(dueDate, now) || isToday(dueDate);

            if (isUpcoming) {
                setTasks((current) => {
                    if (current.find((t) => t.id === newTask.id)) return current;
                    return [...current, newTask].sort((a, b) => {
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    });
                });
            }
        }
    }, []);

    // Group tasks by time period
    const todayTasks = tasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)));
    const tomorrowTasks = tasks.filter((t) => t.dueDate && isTomorrow(new Date(t.dueDate)));
    const thisWeekTasks = tasks.filter(
        (t) =>
            t.dueDate &&
            isThisWeek(new Date(t.dueDate)) &&
            !isToday(new Date(t.dueDate)) &&
            !isTomorrow(new Date(t.dueDate))
    );
    const laterTasks = tasks.filter(
        (t) => t.dueDate && !isThisWeek(new Date(t.dueDate))
    );

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center size-10 sm:size-12 rounded-full bg-blue-500/10">
                            <CalendarClock className="size-5 sm:size-6 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                                Upcoming
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {tasks.length} {tasks.length === 1 ? "task" : "tasks"} scheduled
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Create Input */}
                <div className="mb-4 sm:mb-6">
                    <CreateTaskInput onTaskCreated={handleTaskCreated} />
                </div>

                {/* Task List */}
                {isLoading ? (
                    <LoadingSkeleton />
                ) : tasks.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-8">
                        {/* Today */}
                        {todayTasks.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span>Today</span>
                                    <span className="text-xs font-normal">
                                        {format(new Date(), "MMM d")}
                                    </span>
                                </h2>
                                <TaskList
                                    tasks={todayTasks}
                                    onTaskUpdate={handleTaskUpdate}
                                    onTaskClick={handleTaskOpen}
                                />
                            </div>
                        )}

                        {/* Tomorrow */}
                        {tomorrowTasks.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span>Tomorrow</span>
                                    <span className="text-xs font-normal">
                                        {format(
                                            new Date(new Date().setDate(new Date().getDate() + 1)),
                                            "MMM d"
                                        )}
                                    </span>
                                </h2>
                                <TaskList
                                    tasks={tomorrowTasks}
                                    onTaskUpdate={handleTaskUpdate}
                                    onTaskClick={handleTaskOpen}
                                />
                            </div>
                        )}

                        {/* This Week */}
                        {thisWeekTasks.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    This Week
                                </h2>
                                <TaskList
                                    tasks={thisWeekTasks}
                                    onTaskUpdate={handleTaskUpdate}
                                    onTaskClick={handleTaskOpen}
                                />
                            </div>
                        )}

                        {/* Later */}
                        {laterTasks.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Later
                                </h2>
                                <TaskList
                                    tasks={laterTasks}
                                    onTaskUpdate={handleTaskUpdate}
                                    onTaskClick={handleTaskOpen}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Floating Chat Button */}
            <Button
                size="icon"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 size-12 sm:size-14 rounded-full shadow-lg z-40"
                onClick={() => setIsChatOpen(!isChatOpen)}
            >
                {isChatOpen ? (
                    <X className="size-5 sm:size-6" />
                ) : (
                    <MessageSquare className="size-5 sm:size-6" />
                )}
            </Button>

            {/* Chat Modal */}
            {isChatOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsChatOpen(false)}
                    />
                    <div className="fixed bottom-0 right-0 lg:bottom-6 lg:right-20 w-full lg:w-[440px] h-[90vh] lg:h-[680px] bg-background border-t lg:border lg:rounded-2xl shadow-2xl z-50 flex flex-col">
                        <Chat onClose={() => setIsChatOpen(false)} />
                    </div>
                </>
            )}

            {/* Task Detail Modal */}
            {isTaskCardOpen && (
                <TaskCard
                    task={selectedTask}
                    open={isTaskCardOpen}
                    onOpenChange={setIsTaskCardOpen}
                    onTaskUpdate={(updatedTask) =>
                        handleTaskUpdate(updatedTask.id, updatedTask)
                    }
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
                <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse"
                >
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
            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CalendarClock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-500" />
            </div>
            <h3 className="text-sm sm:text-base font-medium mb-1">
                No upcoming tasks
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-xs">
                Create a task with a due date to see it here
            </p>
        </div>
    );
}
