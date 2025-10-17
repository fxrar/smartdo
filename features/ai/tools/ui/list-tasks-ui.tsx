// features/ai/tools/ui/list-tasks-ui.tsx
"use client";

import { CheckCircle2, Circle, Clock, Loader2, ChevronDown, ChevronUp, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Task {
    id: string;
    title: string;
    description?: string;
    done: boolean;
    dueDate?: string;
    createdAt: string;
}

interface ListTasksInput {
    done?: boolean;
    q?: string;
    limit?: number;
}

interface ListTasksOutput {
    success: boolean;
    message: string;
    tasks?: Task[];
    error?: string;
}

interface ListTasksUIProps {
    input?: ListTasksInput;
    output?: ListTasksOutput;
    toolState: "input-streaming" | "input-available" | "output-available" | "output-error";
    errorText?: string;
}

export function ListTasksUI({ input, output, toolState, errorText }: ListTasksUIProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Loading state
    if (toolState === "input-streaming" || toolState === "input-available") {
        return (
            <Card className="w-full border-primary/20">
                <CardHeader className="flex flex-row items-center gap-3 py-3 px-4">
                    <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium">Loading tasks...</p>
                        {input?.q && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                Searching: {input.q}
                            </p>
                        )}
                    </div>
                </CardHeader>
            </Card>
        );
    }

    // Error state
    if (toolState === "output-error") {
        return (
            <Card className="w-full border-destructive/50 bg-destructive/5">
                <CardHeader className="flex flex-row items-center gap-3 py-3 px-4">
                    <Circle className="size-4 shrink-0 text-destructive" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-destructive">Failed to load tasks</p>
                        <p className="text-[10px] sm:text-xs text-destructive/70 truncate">
                            {errorText || "Something went wrong"}
                        </p>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    // Success state
    if (!output?.tasks) return null;

    const tasks = output.tasks;
    const taskCount = tasks.length;

    return (
        <Card className="w-full p-2">

            <CardHeader className="py-1.5 px-3 sm:py-2 sm:px-3">

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <ListTodo className="size-3.5 sm:size-4 shrink-0 text-primary" />
                        <span className="text-xs sm:text-sm font-medium truncate">
                            {input?.q ? `Search: "${input.q}"` : "Tasks"}
                        </span>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 h-5">
                            {taskCount}
                        </Badge>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="h-6 w-6 p-0 shrink-0 hover:bg-accent"
                    >
                        {isCollapsed ? (
                            <ChevronDown className="size-3.5" />
                        ) : (
                            <ChevronUp className="size-3.5" />
                        )}
                    </Button>
                </div>
            </CardHeader>

            {!isCollapsed && (
                <CardContent className="px-3 pb-3 pt-0 sm:px-4 sm:pb-4">
                    {taskCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                            <Circle className="size-8 sm:size-10 mb-2 opacity-20" />
                            <p className="text-[11px] sm:text-xs">No tasks found</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5 sm:space-y-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={cn(
                                        "group flex items-start gap-2 p-2 sm:p-2.5 rounded-md border bg-background hover:bg-accent/50 transition-colors",
                                        task.done && "opacity-50"
                                    )}
                                >
                                    {task.done ? (
                                        <CheckCircle2 className="size-3 sm:size-3.5 shrink-0 mt-0.5 text-green-600" />
                                    ) : (
                                        <Circle className="size-3 sm:size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={cn(
                                                "text-[11px] sm:text-xs font-medium leading-tight",
                                                task.done && "line-through text-muted-foreground"
                                            )}
                                        >
                                            {task.title}
                                        </p>

                                        {task.description && (
                                            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                                {task.description}
                                            </p>
                                        )}

                                        {task.dueDate && (
                                            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                                                Due: {new Date(task.dueDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
