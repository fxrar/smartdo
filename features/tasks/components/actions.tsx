"use client";

import { TaskResponse, UpdateTaskInput } from "@/features/tasks/types";

/**
 * Client-side action functions that make API calls
 * These are the client-safe versions of the server actions
 */

/**
 * Toggle task completion status
 */
export async function toggleTaskDone(id: string, done: boolean): Promise<TaskResponse> {
    const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ done }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
    }

    const result = await response.json();
    return result.data;
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
    const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
    }
}

/**
 * Update a task with new data
 */
export async function updateTask(id: string, data: UpdateTaskInput): Promise<TaskResponse> {
    const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
    }

    const result = await response.json();
    return result.data;
}

/**
 * Get a single task by ID
 */
export async function getTask(id: string): Promise<TaskResponse> {
    const response = await fetch(`/api/tasks/${id}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch task');
    }

    const result = await response.json();
    return result.data;
}

/**
 * Get all tasks with optional filters
 */
export async function getTasks(filters: {
    done?: boolean;
    q?: string;
    limit?: number;
} = {}): Promise<TaskResponse[]> {
    const queryParams = new URLSearchParams();

    if (filters.done !== undefined) {
        queryParams.set('done', filters.done.toString());
    }
    if (filters.q) {
        queryParams.set('q', filters.q);
    }
    if (filters.limit) {
        queryParams.set('limit', filters.limit.toString());
    }

    const response = await fetch(`/api/tasks?${queryParams}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tasks');
    }

    const result = await response.json();
    return result.data;
}

/**
 * Create a new task
 */
export async function createTask(data: {
    title: string;
    description?: string;
    dueDate?: Date;
}): Promise<TaskResponse> {
    const requestData = {
        ...data,
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
    };

    const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
    }

    const result = await response.json();
    return result.data;
}