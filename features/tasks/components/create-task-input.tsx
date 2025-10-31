"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { createTask } from "./actions";
import { TaskResponse, Priority } from "@/features/tasks/types";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
    Calendar as CalendarIcon,
    Plus,
    Lightbulb,
    FileText, // Icon for Description
    Check, // For marking description as active
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PriorityIcon } from "@/components/ui/priority-icon";

interface CreateTaskInputProps {
    onTaskCreated?: (task: TaskResponse) => void;
}

const priorityOptions: Priority[] = [
    "URGENT",
    "HIGH",
    "MEDIUM",
    "LOW",
    "NONE",
];

const formatPriorityText = (priority: Priority) => {
    if (priority === "NONE") return "No Priority";
    return priority.charAt(0) + priority.slice(1).toLowerCase();
};

// This hook is now used for the POPOVER's textarea
const useAutosizeTextarea = (
    textAreaRef: HTMLTextAreaElement | null,
    value: string
) => {
    useEffect(() => {
        if (textAreaRef) {
            // Set a min-height for the popover textarea
            const minHeight = 80; // approx 4 lines
            textAreaRef.style.height = `${minHeight}px`; // Start at min-height

            const newHeight = Math.max(textAreaRef.scrollHeight, minHeight);

            textAreaRef.style.height = `${newHeight}px`;

            if (textAreaRef.scrollHeight > newHeight) {
                textAreaRef.style.overflowY = "auto";
            } else {
                textAreaRef.style.overflowY = "hidden";
            }
        }
    }, [textAreaRef, value]);
};


export function CreateTaskInput({ onTaskCreated }: CreateTaskInputProps) {
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [priority, setPriority] = useState<Priority>("NONE");
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // STATE MANAGEMENT FOR DESCRIPTION
    const [description, setDescription] = useState("");
    const [tempDescription, setTempDescription] = useState(""); // For editing in the popover

    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
    const [isPriorityPopoverOpen, setIsPriorityPopoverOpen] = useState(false);
    const [isDescriptionPopoverOpen, setIsDescriptionPopoverOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const popoverTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Use the hook on the POPOVER's textarea
    useAutosizeTextarea(popoverTextareaRef.current, tempDescription);


    const handleReset = () => {
        setTitle("");
        setDueDate(undefined);
        setDescription("");
        setTempDescription("");
        setPriority("NONE");
        setIsFocused(false);
        setIsDatePopoverOpen(false);
        setIsPriorityPopoverOpen(false);
        setIsDescriptionPopoverOpen(false);
        setTimeout(() => {
            inputRef.current?.blur();
        }, 0);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Task title cannot be empty");
            inputRef.current?.focus();
            return;
        }

        setIsLoading(true);
        try {
            const newTask = await createTask({
                title: title.trim(),
                description: description.trim() || undefined, // Use the committed description
                dueDate: dueDate,
                priority,
            });

            toast.success("Task created successfully");
            onTaskCreated?.(newTask);
            handleReset();
        } catch (error) {
            console.error("Failed to create task:", error);
            toast.error("Failed to create task");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (
        e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        // Only submit from the main title input
        if (e.currentTarget.id === "main-task-title" && e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }

        // Allow Ctrl+Enter to save from description popover
        if (e.currentTarget.id === "description-textarea" && e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSaveDescription();
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
        if (e.target === inputRef.current) {
            setIsFocused(true);
        }
    }

    // NEW: Save description from popover to main state
    const handleSaveDescription = () => {
        setDescription(tempDescription);
        setIsDescriptionPopoverOpen(false);
    };

    // NEW: Open popover handler
    const onOpenDescriptionPopover = (open: boolean) => {
        if (open) {
            // When opening, sync temp state with main state
            setTempDescription(description);
            // Focus the textarea when popover opens
            setTimeout(() => {
                popoverTextareaRef.current?.focus();
            }, 100);
        }
        setIsDescriptionPopoverOpen(open);
    }


    return (
        <div
            onFocusCapture={handleFocus}
            onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsFocused(false);
                }
            }}
            className={cn(
                "w-full rounded-xl border bg-card transition-all relative",
                isFocused ? "border-primary/50 ring-2 ring-primary/10" : "border-border hover:border-muted-foreground/30"
            )}
        >
            {/* --- Main Input Area (TITLE ONLY) --- */}
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <Plus className={cn(
                        "w-4 h-4 text-muted-foreground flex-shrink-0 mt-[5px] transition-opacity",
                        isFocused ? "opacity-30" : "opacity-100"
                    )} />

                    <div className="flex-1">
                        <input
                            id="main-task-title"
                            ref={inputRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="What needs to be done?"
                            disabled={isLoading}
                            className="w-full text-sm font-medium text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none disabled:opacity-50"
                        />
                    </div>
                </div>
            </div>

            {/* --- Actions Bar (ALWAYS VISIBLE) --- */}
            <div
                className={cn(
                    "flex items-center justify-between px-4 py-2.5 bg-muted/50 border-t border-border/50",
                    "rounded-b-xl"
                )}
            >
                {/* Left Actions */}
                <div className="flex items-center gap-1">

                    {/* Date Picker Button */}
                    <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-7 px-2.5 gap-1.5 text-xs font-medium",
                                    dueDate ? "text-primary hover:text-primary/80 bg-background/50" : "text-muted-foreground"
                                )}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {dueDate ? format(dueDate, "MMM d") : "Date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dueDate}
                                onSelect={(date) => {
                                    setDueDate(date);
                                    setIsDatePopoverOpen(false);
                                }}
                                disabled={(date) =>
                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Priority Picker Button */}
                    <Popover
                        open={isPriorityPopoverOpen}
                        onOpenChange={setIsPriorityPopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-7 px-2.5 gap-1.5 text-xs font-medium",
                                    priority !== "NONE"
                                        ? "text-foreground hover:text-foreground/80 bg-background/50"
                                        : "text-muted-foreground"
                                )}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <PriorityIcon priority={priority} className="w-3.5 h-3.5" />
                                {priority === "NONE" ? "Priority" : formatPriorityText(priority)}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2" align="start">
                            <div className="flex flex-col gap-1">
                                {priorityOptions.map((p) => (
                                    <Button
                                        key={p}
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-8 w-full justify-start gap-2 px-2 text-sm font-normal",
                                            priority === p && "bg-muted" // Highlight selected
                                        )}
                                        onClick={() => {
                                            setPriority(p);
                                            setIsPriorityPopoverOpen(false);
                                        }}
                                        disabled={isLoading}
                                    >
                                        <PriorityIcon priority={p} className="w-3.5 h-3.5" />
                                        {formatPriorityText(p)}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* NEW: Description Button is now a PopoverTrigger */}
                    <Popover open={isDescriptionPopoverOpen} onOpenChange={onOpenDescriptionPopover}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-7 px-2.5 gap-1.5 text-xs font-medium",
                                    description.trim()
                                        ? "text-foreground hover:text-foreground/80 bg-background/50"
                                        : "text-muted-foreground"
                                )}
                                onMouseDown={(e) => e.preventDefault()} // Prevent main component blur
                            >
                                {description.trim() ? (
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                    <FileText className="w-3.5 h-3.5" />
                                )}
                                {description.trim() ? "Edit Description" : "Add Description"}
                            </Button>
                        </PopoverTrigger>

                        {/* NEW: Description Popover Content */}
                        <PopoverContent className="w-80 p-4" align="start">
                            <div className="space-y-4">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    id="description-textarea"
                                    ref={popoverTextareaRef}
                                    value={tempDescription}
                                    // 💡💡💡 FIX: Was e.t.value, changed to e.target.value
                                    onChange={(e) => setTempDescription(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Add a detailed description..."
                                    className="w-full resize-none focus-visible:ring-1 focus-visible:ring-offset-0 p-2 shadow-sm text-sm border"
                                    rows={4} // Default min-height
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsDescriptionPopoverOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="button" size="sm" onClick={handleSaveDescription}>
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* AI Refine Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 gap-1.5 text-xs font-medium text-muted-foreground"
                        disabled
                    >
                        <Lightbulb className="w-3.5 h-3.5" />
                        AI
                    </Button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {(title.trim() || description.trim() || dueDate || priority !== "NONE") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="h-7 px-3 text-xs"
                        >
                            Cancel
                        </Button>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !title.trim()}
                        className="h-7 px-3 text-xs gap-1"
                    >
                        {isLoading ? "Creating..." : "Add Task"}
                        <div className="flex items-center gap-0.5 text-[10px] text-primary-foreground/70 ml-1">
                            <kbd className="px-1 py-0.5 bg-card/20 border border-primary/20 rounded font-medium">
                                ⌘
                            </kbd>
                            <kbd className="px-1 py-0.5 bg-card/20 border border-primary/20 rounded font-medium">
                                ↩
                            </kbd>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}