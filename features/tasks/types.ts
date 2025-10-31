import { z } from "zod";

// Priority enum type
export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

// Database Task model interface
export interface Task {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    done: boolean;
    priority: Priority;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

// Task interface for API responses (with ISO date strings)
export interface TaskResponse {
    id: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    done: boolean;
    priority: Priority;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

// Input types for creating a task
export interface CreateTaskInput {
    title: string;
    description?: string;
    dueDate?: Date;
    priority?: Priority;
}

// Input types for updating a task
export interface UpdateTaskInput {
    title?: string;
    description?: string | null;
    dueDate?: Date | null;
    done?: boolean;
    priority?: Priority;
}

// Simple task filters for listing
export interface TaskFilters {
    done?: boolean;
    q?: string; // search query for title and description
    limit?: number; // simple limit for now
    priority?: Priority;
}

// Zod schemas for validation
export const CreateTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    description: z.string().optional(),
    dueDate: z.date().optional(), // Use string for form input
    priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE']).optional(),
});

export const UpdateTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
    description: z.string().nullable().optional(),
    dueDate: z.date().nullable().optional(), // Use date for form input
    done: z.boolean().optional(),
    priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE']).optional(),
});

export const TaskFiltersSchema = z.object({
    done: z.boolean().optional(),
    q: z.string().optional(),
    limit: z.number().min(1).max(100).optional().default(50),
    priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE']).optional(),
});

// Type inference from Zod schemas
export type CreateTaskInputSchema = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInputSchema = z.infer<typeof UpdateTaskSchema>;
export type TaskFiltersSchema = z.infer<typeof TaskFiltersSchema>;