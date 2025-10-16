"use client";

import { useState } from "react";
import { TaskResponse } from "@/features/tasks/types";
import { deleteTask } from "@/features/tasks/components/actions";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

    const handleDelete = async () => {
        if (isLoading) return;

        setIsLoading(true);

        try {
            await deleteTask(task.id);
            onTaskDeleted?.();
            onClose();
        } catch (err) {
            console.error("Failed to delete task:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && !isLoading) {
            onClose();
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogContent
                className="sm:max-w-md"
                onPointerDownOutside={(e) => {
                    e.preventDefault();
                }}
            >
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <AlertDialogTitle className="text-lg">
                            Delete "{task.title}"?
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-sm">
                        This action cannot be undone. This will permanently delete the task.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete Task"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
