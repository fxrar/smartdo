"use client";

import { useCallback, useEffect, useState } from "react";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskCard } from "@/features/tasks/components/task-card";
import { CreateTaskInput } from "@/features/tasks/components/create-task-input";
import { getTasks } from "@/features/tasks/components/actions";
import { TaskResponse } from "@/features/tasks/types";
import { MessageSquare, X, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chat } from "@/features/ai/components/chat";
import { format } from "date-fns";

export default function TodayTasksPage() {
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

                // Filter tasks for today
                const now = new Date();
                const todayTasks = fetched.filter((task) => {
                    if (!task.dueDate) return false;
                    const dueDate = new Date(task.dueDate);
                    return (
                        dueDate.getFullYear() === now.getFullYear() &&
                        dueDate.getMonth() === now.getMonth() &&
                        dueDate.getDate() === now.getDate()
                    );
                });

                setTasks(todayTasks);
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
                    // Check if updated task is still for today
                    const now = new Date();
                    if (updatedData.dueDate) {
                        const dueDate = new Date(updatedData.dueDate);
                        const isToday =
                            dueDate.getFullYear() === now.getFullYear() &&
                            dueDate.getMonth() === now.getMonth() &&
                            dueDate.getDate() === now.getDate();

                        if (!isToday) {
                            // Remove from list if no longer today
                            const next = current.filter((t) => t.id !== taskId);
                            if (selectedTask?.id === taskId) {
                                setIsTaskCardOpen(false);
                                setSelectedTask(null);
                            }
                            return next;
                        }
                    }

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
        // Only add if it's due today
        if (newTask.dueDate) {
            const now = new Date();
            const dueDate = new Date(newTask.dueDate);
            const isToday =
                dueDate.getFullYear() === now.getFullYear() &&
                dueDate.getMonth() === now.getMonth() &&
                dueDate.getDate() === now.getDate();

            if (isToday) {
                setTasks((current) => {
                    if (current.find((t) => t.id === newTask.id)) return current;
                    return [newTask, ...current];
                });
            }
        }
    }, []);

    const completedCount = tasks.filter((t) => t.done).length;
    const pendingCount = tasks.filter((t) => !t.done).length;

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center size-10 sm:size-12 rounded-full bg-primary/10">
                            <CalendarDays className="size-5 sm:size-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                                Today
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {format(new Date(), "EEEE, MMMM d")}
                            </p>
                        </div>
                    </div>

                    {!isLoading && tasks.length > 0 && (
                        <div className="flex items-center gap-3 mt-4">
                            <div className="text-xs sm:text-sm text-muted-foreground">
                                {completedCount} of {tasks.length} completed
                            </div>
                            {tasks.length > 0 && (
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{
                                            width: `${(completedCount / tasks.length) * 100}%`,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
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
                    <>
                        {pendingCount > 0 && (
                            <div className="mb-6">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    To Do ({pendingCount})
                                </h2>
                                <TaskList
                                    tasks={tasks.filter((t) => !t.done)}
                                    onTaskUpdate={handleTaskUpdate}
                                    onTaskClick={handleTaskOpen}
                                />
                            </div>
                        )}

                        {completedCount > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Completed ({completedCount})
                                </h2>
                                <TaskList
                                    tasks={tasks.filter((t) => t.done)}
                                    onTaskUpdate={handleTaskUpdate}
                                    onTaskClick={handleTaskOpen}
                                />
                            </div>
                        )}
                    </>
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
            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="text-sm sm:text-base font-medium mb-1">
                No tasks for today
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-xs">
                Create a task above or enjoy your free day!
            </p>
        </div>
    );
}
