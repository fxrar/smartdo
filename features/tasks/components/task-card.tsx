"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
    CalendarIcon,
    CheckCircle2,
    Circle,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface TaskCardProps {
    task: TaskResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTaskUpdate?: (updatedTask: TaskResponse) => void;
    onDelete?: (taskId: string) => void;
}

// Inline Editable Description Component
function EditableDescription({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleSave = () => {
        onChange(localValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalValue(value);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-3">
                <Textarea
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    placeholder="Add a description..."
                    className="min-h-[150px] sm:min-h-[200px] resize-none text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            handleCancel();
                        }
                    }}
                />
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleSave}>
                        Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <span className="text-xs text-muted-foreground ml-2">
                        ESC to cancel
                    </span>
                </div>
            </div>
        );
    }

    if (!value) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full p-2 rounded-md hover:bg-muted/50"
            >
                Click to add a description...
            </button>
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer p-2 -m-2 rounded-md hover:bg-muted/50 transition-colors"
        >
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
                    {value}
                </ReactMarkdown>
            </div>
        </div>
    );
}

export function TaskCard({
    task,
    open,
    onOpenChange,
    onTaskUpdate,
    onDelete,
}: TaskCardProps) {
    const [editTitle, setEditTitle] = useState(task?.title || "");
    const [editDescription, setEditDescription] = useState(task?.description || "");
    const [editDueDate, setEditDueDate] = useState<Date | undefined>(
        task?.dueDate ? new Date(task.dueDate) : undefined
    );

    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Update local state when task changes
    useEffect(() => {
        if (task) {
            setEditTitle(task.title);
            setEditDescription(task.description || "");
            setEditDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
            setHasChanges(false);
        }
    }, [task]);

    // Check for changes
    useEffect(() => {
        if (!task) return;

        const titleChanged = editTitle !== task.title;
        const descChanged = editDescription !== (task.description || "");
        const dateChanged =
            editDueDate?.getTime() !==
            (task.dueDate ? new Date(task.dueDate).getTime() : undefined);

        setHasChanges(titleChanged || descChanged || dateChanged);
    }, [editTitle, editDescription, editDueDate, task]);

    const handleSave = useCallback(async () => {
        if (!task || !editTitle.trim()) {
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
            setHasChanges(false);
            toast.success("Changes saved");
        } catch (error) {
            console.error("Failed to update task:", error);
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    }, [task, editTitle, editDescription, editDueDate, onTaskUpdate]);

    if (!task) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="w-full sm:max-w-xl p-0 overflow-hidden flex flex-col"
                side="right"
            >
                {/* Accessible Title (Hidden) */}
                <VisuallyHidden>
                    <SheetHeader>
                        <SheetTitle>Task Details</SheetTitle>
                    </SheetHeader>
                </VisuallyHidden>

                {/* Header */}
                <div className="flex items-start gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b">
                    <div className="flex-shrink-0 pt-1">
                        {task.done ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                        <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Task title"
                            className="text-lg sm:text-xl font-semibold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
                        />
                        {task.done && (
                            <Badge variant="secondary" className="text-xs">
                                Completed
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-6">
                    {/* Date & Time Section */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Due Date
                        </h2>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal text-sm",
                                        !editDueDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">
                                        {editDueDate ? (
                                            format(editDueDate, "PPP 'at' p")
                                        ) : (
                                            "Pick a date"
                                        )}
                                    </span>
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
                                            editDueDate ? format(editDueDate, "HH:mm") : ""
                                        }
                                        onChange={(e) => {
                                            const [hours, minutes] = e.target.value.split(":");
                                            const newDate = editDueDate || new Date();
                                            newDate.setHours(
                                                parseInt(hours),
                                                parseInt(minutes)
                                            );
                                            setEditDueDate(new Date(newDate));
                                        }}
                                        className="w-full"
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Separator />

                    {/* Description Section with Click to Edit */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Description
                        </h2>
                        <EditableDescription
                            value={editDescription}
                            onChange={setEditDescription}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 justify-between bg-background">
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(task.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Delete</span>
                        </Button>
                    )}

                    <div className="ml-auto">
                        {hasChanges && (
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving || !editTitle.trim()}
                                className="ml-auto"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
