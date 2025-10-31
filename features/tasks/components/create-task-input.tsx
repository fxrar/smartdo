"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { createTask } from "./actions";
import { TaskResponse, Priority } from "@/features/tasks/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, FileText, Plus, Lightbulb, Clock, Flag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { PrioritySelector } from "@/components/ui/priority-selector";

interface CreateTaskInputProps {
    onTaskCreated?: (task: TaskResponse) => void;
}

export function CreateTaskInput({ onTaskCreated }: CreateTaskInputProps) {
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>('NONE');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
    const [isDescriptionPopoverOpen, setIsDescriptionPopoverOpen] = useState(false);
    const [isPriorityPopoverOpen, setIsPriorityPopoverOpen] = useState(false);

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
                priority,
            });

            setTitle("");
            setDueDate(undefined);
            setDescription("");
            setPriority('NONE');
            setIsDatePopoverOpen(false);
            setIsDescriptionPopoverOpen(false);
            setIsPriorityPopoverOpen(false);
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
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }
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

    return (
        <div
            className={cn(
                "w-full rounded-xl border bg-card transition-all",
                isFocused ? "border-ring ring-2 ring-ring/5" : "border-border"
            )}
        >
            {/* Title Input Row */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder="What needs to be done?"
                    disabled={isLoading}
                    className="flex-1 text-sm font-medium text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none disabled:opacity-50"
                />
            </div>

            {/* Metadata & Actions Row */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50">
                {/* Left Actions */}
                <div className="flex items-center gap-1">
                    {/* Date Picker Button */}
                    <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                        <PopoverTrigger asChild>
                            <button className="h-7 px-2.5 flex items-center gap-1.5 text-muted-foreground hover:bg-card hover:text-foreground rounded-md text-xs font-medium transition-colors">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {dueDate ? format(dueDate, "MMM d") : "Date"}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto p-0"
                            align="start"
                            onInteractOutside={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.closest("[data-radix-popper-content-wrapper]")) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <div className="flex flex-col">
                                {/* Quick Date Options */}
                                <div className="flex gap-1 p-2 border-b border-border">
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
                                    <div className="p-3 border-t border-border space-y-2">
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
                                            className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background"
                                        />
                                    </div>
                                )}
                                {/* Done Button */}
                                <div className="p-2 border-t border-border flex justify-end">
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

                    {/* Description Button */}
                    <Popover open={isDescriptionPopoverOpen} onOpenChange={setIsDescriptionPopoverOpen}>
                        <PopoverTrigger asChild>
                            <button className="h-7 px-2.5 flex items-center gap-1.5 text-muted-foreground hover:bg-card hover:text-foreground rounded-md text-xs font-medium transition-colors">
                                <FileText className="w-3.5 h-3.5" />
                                Note
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-80"
                            align="start"
                            onInteractOutside={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.closest("[data-radix-popper-content-wrapper]")) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">Description</label>
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

                    {/* Priority Button */}
                    <Popover open={isPriorityPopoverOpen} onOpenChange={setIsPriorityPopoverOpen}>
                        <PopoverTrigger asChild>
                            <button className="h-7 px-2.5 flex items-center gap-1.5 text-muted-foreground hover:bg-card hover:text-foreground rounded-md text-xs font-medium transition-colors">
                                <Flag className="w-3.5 h-3.5" />
                                Priority
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-48"
                            align="start"
                            onInteractOutside={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.closest("[data-radix-popper-content-wrapper]")) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <div className="space-y-3 p-3">
                                <label className="text-sm font-medium text-foreground">Priority</label>
                                <PrioritySelector
                                    value={priority}
                                    onChange={setPriority}
                                    disabled={isLoading}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={() => setIsPriorityPopoverOpen(false)}
                                        className="h-8"
                                    >
                                        Done
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* AI Refine Button */}
                    <button className="h-7 px-2.5 flex items-center gap-1.5 text-muted-foreground hover:bg-card hover:text-foreground rounded-md text-xs font-medium transition-colors">
                        <Lightbulb className="w-3.5 h-3.5" />
                        AI
                    </button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Keyboard Hint */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px] font-medium">
                            ⌘
                        </kbd>
                        <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px] font-medium">
                            Enter
                        </kbd>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !title.trim()}
                        className="h-7 px-3 text-xs font-semibold rounded-md transition-colors"
                    >
                        {isLoading ? "Creating..." : "Add Task"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
