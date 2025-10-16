"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { createTask } from "./actions";
import { TaskResponse } from "@/features/tasks/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, FileText, X, Send, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreateTaskInputProps {
    onTaskCreated?: (task: TaskResponse) => void;
}

export function CreateTaskInput({ onTaskCreated }: CreateTaskInputProps) {
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Controlled popover states
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
    const [isDescriptionPopoverOpen, setIsDescriptionPopoverOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Task title cannot be empty");
            return;
        }

        setIsLoading(true);
        try {
            const newTask = await createTask({
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate: dueDate,
            });

            setTitle("");
            setDueDate(undefined);
            setDescription("");
            setIsDatePopoverOpen(false);
            setIsDescriptionPopoverOpen(false);
            onTaskCreated?.(newTask);
            toast.success("Task created successfully");
            inputRef.current?.blur();
        } catch (error) {
            console.error("Failed to create task:", error);
            toast.error("Failed to create task");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleDateBadgeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (dueDate) {
            // If date exists, clicking badge opens popover to edit
            setIsDatePopoverOpen(true);
        }
    };

    const handleDescriptionBadgeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (description) {
            // If description exists, clicking badge opens popover to edit
            setIsDescriptionPopoverOpen(true);
        }
    };

    const clearDueDate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDueDate(undefined);
        setIsDatePopoverOpen(false);
        inputRef.current?.focus();
    };

    const clearDescription = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDescription("");
        setIsDescriptionPopoverOpen(false);
        inputRef.current?.focus();
    };

    const quickDateOptions = [
        { label: "Today", date: new Date() },
        {
            label: "Tomorrow",
            date: (() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow;
            })(),
        },
        {
            label: "Next Week",
            date: (() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                return nextWeek;
            })(),
        },
    ];

    const showHint = !title && !isFocused && !dueDate && !description;

    return (
        <div
            className={cn(
                "relative w-full rounded-lg border bg-card transition-colors duration-200",
                isFocused ? "border-primary" : "border-border"
            )}
        >
            {/* Main Input Area */}
            <div className="relative flex flex-col gap-3 p-3">
                {/* Title Input with Inline Badges */}
                <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
                    <input
                        ref={inputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="Add a task..."
                        disabled={isLoading}
                        className="flex-1 min-w-[180px] bg-transparent text-[15px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                    />

                    {/* Quick Action Badges */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Due Date Badge */}
                        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                            <PopoverTrigger asChild>
                                {dueDate ? (
                                    <Badge
                                        variant="secondary"
                                        className="h-7 px-2.5 gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 cursor-pointer border-0"
                                        onClick={handleDateBadgeClick}
                                    >
                                        <CalendarIcon className="h-3 w-3" />
                                        <span className="text-xs font-medium">{format(dueDate, "MMM d")}</span>
                                        <button
                                            onClick={clearDueDate}
                                            className="hover:bg-blue-500/30 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="h-7 px-2.5 gap-1.5 cursor-pointer hover:bg-accent transition-colors"
                                    >
                                        <CalendarIcon className="h-3 w-3" />
                                        <span className="text-xs">Date</span>
                                    </Badge>
                                )}
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                                onInteractOutside={(e) => {
                                    // Prevent closing when clicking inside the popover
                                    const target = e.target as HTMLElement;
                                    if (target.closest("[data-radix-popper-content-wrapper]")) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <div className="flex flex-col">
                                    {/* Quick Date Options */}
                                    <div className="flex gap-1 p-2 border-b">
                                        {quickDateOptions.map((option) => (
                                            <Button
                                                key={option.label}
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => {
                                                    const date = new Date(option.date);
                                                    date.setHours(9, 0, 0, 0);
                                                    setDueDate(date);
                                                }}
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </div>
                                    {/* Calendar */}
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={(date) => {
                                            if (date) {
                                                date.setHours(dueDate?.getHours() || 9, dueDate?.getMinutes() || 0, 0, 0);
                                                setDueDate(date);
                                            }
                                        }}
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        initialFocus
                                    />
                                    {/* Time Picker */}
                                    {dueDate && (
                                        <div className="p-3 border-t space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" />
                                                Time
                                            </label>
                                            <input
                                                type="time"
                                                value={format(dueDate, "HH:mm")}
                                                onChange={(e) => {
                                                    const [hours, minutes] = e.target.value.split(":");
                                                    const newDate = new Date(dueDate);
                                                    newDate.setHours(parseInt(hours), parseInt(minutes));
                                                    setDueDate(newDate);
                                                }}
                                                className="w-full px-3 py-1.5 text-sm border rounded-md"
                                            />
                                        </div>
                                    )}
                                    {/* Done Button */}
                                    <div className="p-2 border-t flex justify-end">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setIsDatePopoverOpen(false)}
                                            className="h-7 text-xs"
                                        >
                                            Done
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Description Badge */}
                        <Popover open={isDescriptionPopoverOpen} onOpenChange={setIsDescriptionPopoverOpen}>
                            <PopoverTrigger asChild>
                                {description ? (
                                    <Badge
                                        variant="secondary"
                                        className="h-7 px-2.5 gap-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 cursor-pointer border-0"
                                        onClick={handleDescriptionBadgeClick}
                                    >
                                        <FileText className="h-3 w-3" />
                                        <span className="text-xs font-medium max-w-[80px] truncate">
                                            {description}
                                        </span>
                                        <button
                                            onClick={clearDescription}
                                            className="hover:bg-purple-500/30 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="h-7 px-2.5 gap-1.5 cursor-pointer hover:bg-accent transition-colors"
                                    >
                                        <FileText className="h-3 w-3" />
                                        <span className="text-xs">Note</span>
                                    </Badge>
                                )}
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-80"
                                align="start"
                                onInteractOutside={(e) => {
                                    // Prevent closing when clicking inside the popover
                                    const target = e.target as HTMLElement;
                                    if (target.closest("[data-radix-popper-content-wrapper]")) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add details about your task..."
                                        className="min-h-[100px] resize-none"
                                        autoFocus
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Supports Markdown formatting
                                    </p>
                                    <div className="flex justify-end">
                                        <Button
                                            size="sm"
                                            onClick={() => setIsDescriptionPopoverOpen(false)}
                                            className="h-8"
                                        >
                                            Done
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Submit Button (appears when title is filled) */}
                {title.trim() && (
                    <div className="flex justify-end border-t pt-2">
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="h-8 gap-1.5"
                        >
                            <Send className="h-3.5 w-3.5" />
                            {isLoading ? "Creating..." : "Add Task"}
                        </Button>
                    </div>
                )}

                {/* Hint Text - now only shows when truly empty */}
                {showHint && (
                    <div className="text-[11px] text-muted-foreground/50">
                        Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> to add
                    </div>
                )}
            </div>
        </div>
    );
}
