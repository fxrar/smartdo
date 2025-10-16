"use client";

import { useState } from "react";
import { TaskResponse } from "@/features/tasks/types";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { updateTask } from "./actions";

// Shadcn UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    CalendarIcon,
    ClockIcon,
    CheckCircle2,
    Circle,
    PencilIcon,
    SaveIcon,
    XIcon,
} from "lucide-react";
import { toast } from "sonner";

interface TaskCardProps {
    task: TaskResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTaskUpdate?: (updatedTask: TaskResponse) => void;
    onDelete?: (taskId: string) => void;
}

export function TaskCard({
    task,
    open,
    onOpenChange,
    onTaskUpdate,
    onDelete,
}: TaskCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Edit states
    const [editTitle, setEditTitle] = useState(task?.title || "");
    const [editDescription, setEditDescription] = useState(task?.description || "");
    const [editDueDate, setEditDueDate] = useState<Date | undefined>(
        task?.dueDate ? new Date(task.dueDate) : undefined
    );

    if (!task) return null;

    const formattedDate = task.dueDate
        ? format(new Date(task.dueDate), "EEEE, MMMM d, yyyy")
        : null;

    const formattedTime = task.dueDate ? format(new Date(task.dueDate), "h:mm a") : null;

    const handleEdit = () => {
        setEditTitle(task.title);
        setEditDescription(task.description || "");
        setEditDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
        setEditDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    };

    const handleSave = async () => {
        if (!editTitle.trim()) {
            toast.error("Title cannot be empty");
            return;
        }

        setIsSaving(true);
        try {
            const updatedTask = await updateTask(task.id, {
                title: editTitle.trim(),
                description: editDescription.trim() || undefined,
                dueDate: editDueDate,
            });

            onTaskUpdate?.(updatedTask);
            setIsEditing(false);
            toast.success("Task updated successfully");
        } catch (error) {
            console.error("Failed to update task:", error);
            toast.error("Failed to update task");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl w-full p-0 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-start gap-4 px-6 py-5 border-b">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Status Icon */}
                        <div className="flex-shrink-0 pt-1">
                            {task.done ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                            {isEditing ? (
                                <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Task title"
                                    className="text-xl font-semibold"
                                    autoFocus
                                />
                            ) : (
                                <h1
                                    className={cn(
                                        "text-xl font-semibold leading-tight tracking-tight break-words",
                                        task.done && "text-muted-foreground line-through"
                                    )}
                                >
                                    {task.title}
                                </h1>
                            )}
                            {task.done && !isEditing && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                    Completed
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Date & Time Section */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Due Date
                        </h2>
                        {isEditing ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !editDueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editDueDate ? (
                                            format(editDueDate, "PPP 'at' p")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={editDueDate}
                                        onSelect={setEditDueDate}
                                        initialFocus
                                    />
                                    <div className="p-3 border-t">
                                        <Input
                                            type="time"
                                            value={
                                                editDueDate
                                                    ? format(editDueDate, "HH:mm")
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const [hours, minutes] = e.target.value.split(":");
                                                const newDate = editDueDate || new Date();
                                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                                setEditDueDate(new Date(newDate));
                                            }}
                                            className="w-full"
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        ) : task.dueDate ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="font-medium">{formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-muted-foreground">{formattedTime}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No due date set</p>
                        )}
                    </div>

                    {((task.dueDate || editDueDate) || task.description || isEditing) && <Separator />}

                    {/* Description Section */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Description
                        </h2>
                        {isEditing ? (
                            <Textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Add a description..."
                                className="min-h-[200px] resize-none"
                            />
                        ) : task.description ? (
                            <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ children }) => (
                                            <p className="text-sm leading-relaxed text-foreground/90 mb-3 last:mb-0">
                                                {children}
                                            </p>
                                        ),
                                        h1: ({ children }) => (
                                            <h1 className="text-lg font-bold mb-3 text-foreground">
                                                {children}
                                            </h1>
                                        ),
                                        h2: ({ children }) => (
                                            <h2 className="text-base font-bold mb-2 text-foreground">
                                                {children}
                                            </h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="text-sm font-semibold mb-2 text-foreground">
                                                {children}
                                            </h3>
                                        ),
                                        ul: ({ children }) => (
                                            <ul className="list-disc list-inside space-y-1 mb-3 text-sm">
                                                {children}
                                            </ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="list-decimal list-inside space-y-1 mb-3 text-sm">
                                                {children}
                                            </ol>
                                        ),
                                        li: ({ children }) => (
                                            <li className="text-foreground/90">{children}</li>
                                        ),
                                        blockquote: ({ children }) => (
                                            <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-3">
                                                {children}
                                            </blockquote>
                                        ),
                                        code: ({ children, className }) => {
                                            const isInline = !className;
                                            return isInline ? (
                                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground">
                                                    {children}
                                                </code>
                                            ) : (
                                                <code className="block bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                                                    {children}
                                                </code>
                                            );
                                        },
                                        strong: ({ children }) => (
                                            <strong className="font-semibold text-foreground">
                                                {children}
                                            </strong>
                                        ),
                                        em: ({ children }) => (
                                            <em className="italic text-foreground/90">{children}</em>
                                        ),
                                        a: ({ children, href }) => (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {children}
                                            </a>
                                        ),
                                    }}
                                >
                                    {task.description}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No description</p>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t px-6 py-4 flex items-center gap-2 justify-between">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                <XIcon className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                <SaveIcon className="mr-2 h-4 w-4" />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={handleEdit}>
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit Task
                            </Button>
                            {onDelete && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDelete(task.id)}
                                >
                                    Delete Task
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
