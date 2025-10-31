"use client";


import { TaskResponse, Priority } from "@/features/tasks/types";
import { Button } from "@/components/ui/button";

import {
    Calendar as CalendarIcon,
    Plus,
    Lightbulb,
    Flag,
} from "lucide-react";

import { cn } from "@/lib/utils";



interface CreateTaskInputProps {
    onTaskCreated?: (task: TaskResponse) => void;
}

export function CreateTaskInput({ onTaskCreated }: CreateTaskInputProps) {
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("NONE");
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
    const [isPriorityPopoverOpen, setIsPriorityPopoverOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /**
     * Resets all form fields and collapses the input.
     */
    const handleReset = () => {
        setTitle("");
        setDueDate(undefined);
        setDescription("");
        setPriority("NONE");
        setIsFocused(false);
        setIsDatePopoverOpen(false);
        setIsPriorityPopoverOpen(false);
        inputRef.current?.blur();
        textareaRef.current?.blur();
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
                description: description.trim() || undefined,
                dueDate: dueDate,
                priority,
            });

            toast.success("Task created successfully");
            onTaskCreated?.(newTask);
            handleReset(); // Reset and collapse on success
        } catch (error) {
            console.error("Failed to create task:", error);
            toast.error("Failed to create task");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles Cmd/Ctrl + Enter submission from both title and description fields.
     */
    const handleKeyDown = (
        e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div
            className={cn(
                "w-full rounded-xl border bg-card transition-all",
                // Apply a subtle ring when focused to match the aesthetic
                isFocused ? "border-primary/50 ring-2 ring-primary/10" : "border-border"
            )}
        >
            {/* --- Main Input Area --- */}
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-[5px]" />
                    <div className="flex-1 space-y-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            placeholder="What needs to be done?"
                            disabled={isLoading}
                            className="w-full text-sm font-medium text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none disabled:opacity-50"
                        />

                        {/* --- Expanded Area (Description) --- */}
                        {/* This animates in when the input is focused */}
                        {isFocused && (
                            <div className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
                                <Textarea
                                    ref={textareaRef}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onKeyDown={handleKeyDown} // Allow submit from textarea
                                    onFocus={() => setIsFocused(true)}
                                    placeholder="Add a description..."
                                    className="min-h-[60px] w-full resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none text-sm text-muted-foreground"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Actions Bar --- */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-t border-border">
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
                                    dueDate ? "text-primary" : "text-muted-foreground"
                                )}
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
                                    setIsDatePopoverOpen(false); // Close on select
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
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                {/* Use a dynamic icon based on priority */}
                                <PriorityIcon priority={priority} className="w-3.5 h-3.5" />
                                {priority === "NONE"
                                    ? "Priority"
                                    : priority.charAt(0) + priority.slice(1).toLowerCase()}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-3" align="start">
                            <PrioritySelector
                                value={priority}
                                onChange={(p) => {
                                    setPriority(p);
                                    setIsPriorityPopoverOpen(false); // Close on select
                                }}
                                disabled={isLoading}
                            />
                        </PopoverContent>
                    </Popover>

                    {/* AI Refine Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 gap-1.5 text-xs font-medium text-muted-foreground"
                    >
                        <Lightbulb className="w-3.5 h-3.5" />
                        AI
                    </Button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Show "Cancel" only when expanded */}
                    {isFocused ? (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="h-7 px-3 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading || !title.trim()}
                                className="h-7 px-3 text-xs"
                            >
                                {isLoading ? "Creating..." : "Add Task"}
                            </Button>
                        </>
                    ) : (
                        <>
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
                                className="h-7 px-3 text-xs"
                            >
                                Add Task
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * A helper component to show the correct priority icon.
 * You would place this in "@/components/ui/priority-icon.tsx" or similar.
 */
export const PriorityIcon = ({
    priority,
    className,
}: {
    priority: Priority;
    className?: string;
}) => {
    const priorityMap: Record<Priority, { icon: React.ElementType; color: string }> = {
        URGENT: { icon: Flag, color: "text-red-500" },
        HIGH: { icon: Flag, color: "text-orange-500" },
        MEDIUM: { icon: Flag, color: "text-blue-500" },
        LOW: { icon: Flag, color: "text-green-500" },
        NONE: { icon: Flag, color: "text-muted-foreground" },
    };
    const Icon = priorityMap[priority]?.icon || Flag;
    const color = priorityMap[priority]?.color || "text-muted-foreground";

    return <Icon className={cn(className, color, priority !== 'NONE' && 'fill-current')} />;
};