"use client";

import { useState } from "react";
import { TaskResponse } from "@/features/tasks/types";
import { deleteTask } from "@/features/tasks/components/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteTaskProps {
    task: TaskResponse;
    isOpen: boolean;
    onClose: () => void;
    onTaskDeleted?: () => void;
}

export function DeleteTask({ task, isOpen, onClose, onTaskDeleted }: DeleteTaskProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            await deleteTask(task.id);
            onTaskDeleted?.();
        } catch (err) {
            console.error("Failed to delete task:", err);
            setError(err instanceof Error ? err.message : "Failed to delete task. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setError(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Task
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this task? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-medium text-lg">{task.title}</h4>
                            {task.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                    {task.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                            {task.dueDate && (
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${task.done
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                    }`}
                            >
                                {task.done ? "Completed" : "Pending"}
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete Task"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}