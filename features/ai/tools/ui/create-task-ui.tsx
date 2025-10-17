// features/ai/tools/ui/create-task-ui.tsx
"use client";

import { CheckCircle2, Loader2, XCircle, Calendar, FileText } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Task {
    id: string;
    title: string;
    description?: string;
    done: boolean;
    dueDate?: string;
    createdAt: string;
}

interface CreateTaskInput {
    title: string;
    description?: string;
    done?: boolean;
    dueDate?: string;
}

interface CreateTaskOutput {
    success: boolean;
    message: string;
    task?: Task;
    error?: string;
}

interface CreateTaskUIProps {
    input?: CreateTaskInput;
    output?: CreateTaskOutput;
    toolState: "input-streaming" | "input-available" | "output-available" | "output-error";
    errorText?: string;
}

export function CreateTaskUI({ input, output, toolState, errorText }: CreateTaskUIProps) {
    // Loading state
    if (toolState === "input-streaming" || toolState === "input-available") {
        return (
            <Card className="w-full p-0 border-primary/20 bg-primary/5">
                <CardHeader className="p-2.5">
                    <div className="flex items-center gap-2.5">
                        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                        <span className="text-xs font-medium">Creating task...</span>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    // Error state
    if (toolState === "output-error" || !output?.success) {
        return (
            <Card className="w-full p-0 border-destructive/50 bg-destructive/5">
                <CardHeader className="p-2.5">
                    <div className="flex items-center gap-2.5">
                        <XCircle className="size-4 shrink-0 text-destructive" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-destructive">Failed to create task</p>
                            <p className="text-[11px] text-destructive/70 truncate mt-0.5">
                                {errorText || output?.message || "Something went wrong"}
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    // Success state
    if (!output?.task) return null;

    const task = output.task;

    return (
        <Card className="w-full p-0 border-green-600/30 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="p-2.5">
                <div className="flex gap-2.5">
                    {/* Icon badge - smaller */}
                    <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="size-4 text-green-600 dark:text-green-500" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                        {/* Status badge - smaller */}
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-green-600/30 text-green-700 dark:text-green-400">
                            ✓ Created
                        </Badge>

                        {/* Title */}
                        <h4 className="text-xs font-semibold leading-tight">
                            {task.title}
                        </h4>

                        {/* Description */}
                        {task.description && (
                            <div className="flex gap-1.5 items-start">
                                <FileText className="size-3 shrink-0 text-muted-foreground mt-0.5" />
                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                    {task.description}
                                </p>
                            </div>
                        )}

                        {/* Due date */}
                        {task.dueDate && (
                            <div className="flex gap-1.5 items-center">
                                <Calendar className="size-3 shrink-0 text-blue-600 dark:text-blue-400" />
                                <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                                    Due {new Date(task.dueDate).toLocaleDateString([], {
                                        month: "short",
                                        day: "numeric"
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
