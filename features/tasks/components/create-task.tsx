"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { CreateTaskSchema, TaskResponse } from "@/features/tasks/types";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { createTask } from "./actions";
import { toast } from "sonner";

type CreateTaskFormValues = z.infer<typeof CreateTaskSchema>;

interface CreateTaskProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTaskCreated?: (task: TaskResponse) => void;
}

export function CreateTask({ open, onOpenChange, onTaskCreated }: CreateTaskProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CreateTaskFormValues>({
        resolver: zodResolver(CreateTaskSchema),
        defaultValues: {
            title: "",
            description: "",
            dueDate: undefined,
        },
    });

    const onSubmit = async (data: CreateTaskFormValues) => {
        setIsLoading(true);

        try {
            const taskData = {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            };

            const newTask = await createTask(taskData);

            form.reset();
            onOpenChange(false);
            onTaskCreated?.(newTask);
            toast.success("Task created successfully");
        } catch (err) {
            console.error("Failed to create task:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Failed to create task. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && !isLoading) {
            form.reset();
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to your to-do list. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter task title..."
                                            {...field}
                                            disabled={isLoading}
                                            className="h-10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add task details (optional)..."
                                            className="resize-none min-h-[100px]"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Supports Markdown formatting
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Due Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full justify-start text-left font-normal h-10 ${!field.value && "text-muted-foreground"
                                                        }`}
                                                    disabled={isLoading}
                                                >
                                                    <CalendarDays className="mr-2 h-4 w-4 opacity-50" />
                                                    {field.value ? (
                                                        format(new Date(field.value), "PPP 'at' p")
                                                    ) : (
                                                        <span>Pick a date and time</span>
                                                    )}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        // Set time to current time if not set
                                                        const now = new Date();
                                                        date.setHours(now.getHours(), now.getMinutes());
                                                    }
                                                    field.onChange(date);
                                                }}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                initialFocus
                                            />
                                            <div className="p-3 border-t">
                                                <Input
                                                    type="time"
                                                    value={
                                                        field.value
                                                            ? format(new Date(field.value), "HH:mm")
                                                            : format(new Date(), "HH:mm")
                                                    }
                                                    onChange={(e) => {
                                                        const [hours, minutes] = e.target.value.split(":");
                                                        const newDate = field.value
                                                            ? new Date(field.value)
                                                            : new Date();
                                                        newDate.setHours(parseInt(hours), parseInt(minutes));
                                                        field.onChange(newDate);
                                                    }}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription className="text-xs">
                                        Optional: Set when this task should be completed
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Task"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
