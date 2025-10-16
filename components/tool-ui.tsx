// components/tool-ui.tsx
"use client";

import { CheckCircle, Loader2, Clock, Trash2, Edit, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ToolUIProps {
    toolName: string;
    state: string;
    input?: any;
    output?: any;
}

export function ToolUI({ toolName, state, input, output }: ToolUIProps) {
    // Show nothing while pending
    if (state === "call" || state === "call-pending") {
        return null;
    }

    // Render based on tool type
    switch (toolName) {
        case "listTasks":
            return <TaskListUI tasks={output?.tasks || []} state={state} />;
        case "createTask":
            return <TaskCreatedUI task={output?.task} state={state} />;
        case "updateTask":
            return <TaskUpdatedUI task={output?.task} state={state} />;
        case "deleteTask":
            return <TaskDeletedUI taskId={input?.id} state={state} />;
        default:
            return null;
    }
}

function TaskListUI({ tasks, state }: { tasks: any[]; state: string }) {
    if (state === "partial-call") {
        return (
            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin text-blue-600" />
                        <CardTitle className="text-sm font-medium">Loading tasks...</CardTitle>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    if (!tasks.length) {
        return (
            <Card className="border-gray-200">
                <CardContent className="flex items-center gap-3 py-4">
                    <List className="size-5 text-gray-400" />
                    <p className="text-sm text-muted-foreground">No tasks found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Your Tasks</CardTitle>
                    <Badge variant="secondary">{tasks.length}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {tasks.map((task, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg bg-background p-3 shadow-sm"
                    >
                        <div
                            className={cn(
                                "mt-0.5 size-2 rounded-full",
                                task.completed ? "bg-green-500" : "bg-gray-300"
                            )}
                        />
                        <div className="flex-1 space-y-1">
                            <p className={cn("text-sm font-medium", task.completed && "line-through text-muted-foreground")}>
                                {task.title}
                            </p>
                            {task.description && (
                                <p className="text-xs text-muted-foreground">{task.description}</p>
                            )}
                            {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="size-3" />
                                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function TaskCreatedUI({ task, state }: { task: any; state: string }) {
    if (state === "partial-call") {
        return (
            <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin text-green-600" />
                        <CardTitle className="text-sm font-medium">Creating task...</CardTitle>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="border-green-200 bg-green-50/50">
            <CardContent className="flex items-start gap-3 py-4">
                <CheckCircle className="size-5 text-green-600" />
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Task Created</p>
                    <p className="text-sm text-muted-foreground">{task?.title}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function TaskUpdatedUI({ task, state }: { task: any; state: string }) {
    if (state === "partial-call") {
        return (
            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin text-blue-600" />
                        <CardTitle className="text-sm font-medium">Updating task...</CardTitle>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="flex items-start gap-3 py-4">
                <Edit className="size-5 text-blue-600" />
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Task Updated</p>
                    <p className="text-sm text-muted-foreground">{task?.title}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function TaskDeletedUI({ taskId, state }: { taskId: string; state: string }) {
    if (state === "partial-call") {
        return (
            <Card className="border-red-200 bg-red-50/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin text-red-600" />
                        <CardTitle className="text-sm font-medium">Deleting task...</CardTitle>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="border-red-200 bg-red-50/50">
            <CardContent className="flex items-start gap-3 py-4">
                <Trash2 className="size-5 text-red-600" />
                <div className="flex-1">
                    <p className="text-sm font-medium">Task Deleted</p>
                </div>
            </CardContent>
        </Card>
    );
}
