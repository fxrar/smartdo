import { prisma } from "@/lib/prisma";
import {
    Task,
    TaskResponse,
    CreateTaskInput,
    UpdateTaskInput,
    TaskFilters,
    CreateTaskSchema,
    UpdateTaskSchema,
    TaskFiltersSchema,
    Priority
} from "./types";
import {
    getAuthenticatedUser,
    handleValidationError,
    handleDatabaseError,
    TaskError
} from "./utils";


/**
 * Create a new task for the authenticated user
 */
export async function createTask(input: CreateTaskInput): Promise<TaskResponse> {
    try {
        // Validate input
        const validatedInput = CreateTaskSchema.parse(input);

        // Get authenticated user
        const userId = await getAuthenticatedUser();

        // Create task
        const task = await prisma.task.create({
            data: {
                title: validatedInput.title,
                description: validatedInput.description,
                dueDate: validatedInput.dueDate,
                priority: (validatedInput.priority as Priority) || ('NONE' as Priority),
                userId
            }
        });

        return formatTaskForResponse(task);
    } catch (error) {
        if (error instanceof TaskError) {
            throw error;
        }

        if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
            throw handleValidationError(error);
        }

        throw handleDatabaseError(error);
    }
}


/**
 * Get a single task by ID (only if owned by the authenticated user)
 */
export async function getTask(id: string): Promise<TaskResponse> {
    try {
        // Get authenticated user
        const userId = await getAuthenticatedUser();

        // Get task (automatically filtered by userId)
        const task = await prisma.task.findFirst({
            where: {
                id,
                userId // This ensures user can only access their own tasks
            }
        });

        if (!task) {
            throw new TaskError("Task not found", 404);
        }

        return formatTaskForResponse(task);
    } catch (error) {
        if (error instanceof TaskError) {
            throw error;
        }

        throw handleDatabaseError(error);
    }
}


/**
 * Update a task (only if owned by the authenticated user)
 */
export async function updateTask(id: string, input: UpdateTaskInput): Promise<TaskResponse> {
    try {
        // Validate input
        const validatedInput = UpdateTaskSchema.parse(input);

        // Get authenticated user
        const userId = await getAuthenticatedUser();

        // Update task - single query instead of updateMany + findUnique
        const updateData: any = {};

        if (validatedInput.title !== undefined) {
            updateData.title = validatedInput.title;
        }
        if (validatedInput.description !== undefined) {
            updateData.description = validatedInput.description;
        }
        if (validatedInput.dueDate !== undefined) {
            updateData.dueDate = validatedInput.dueDate;
        }
        if (validatedInput.done !== undefined) {
            updateData.done = validatedInput.done;
        }
        if (validatedInput.priority !== undefined) {
            updateData.priority = validatedInput.priority as Priority;
        }

        const task = await prisma.task.update({
            where: { id },
            data: updateData
        });

        // Check ownership after update
        if (task.userId !== userId) {
            throw new TaskError("Task not found", 404);
        }

        return formatTaskForResponse(task);
    } catch (error) {
        if (error instanceof TaskError) {
            throw error;
        }

        if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
            throw handleValidationError(error);
        }

        throw handleDatabaseError(error);
    }
}


/**
 * Delete a task (only if owned by the authenticated user)
 */
export async function deleteTask(id: string): Promise<void> {
    try {
        // Get authenticated user
        const userId = await getAuthenticatedUser();

        // Delete task (automatically filtered by userId)
        const result = await prisma.task.deleteMany({
            where: {
                id,
                userId // This ensures user can only delete their own tasks
            }
        });

        if (result.count === 0) {
            throw new TaskError("Task not found", 404);
        }
    } catch (error) {
        if (error instanceof TaskError) {
            throw error;
        }

        throw handleDatabaseError(error);
    }
}


/**
 * Get tasks for the authenticated user with simple filtering
 */
export async function getTasks(filters: TaskFilters = {}): Promise<TaskResponse[]> {
    try {
        // Validate filters
        const validatedFilters = TaskFiltersSchema.parse(filters);

        // Get authenticated user
        const userId = await getAuthenticatedUser();

        const {
            done,
            q,
            limit = 50,
            priority
        } = validatedFilters;

        // Build where clause
        const where: any = { userId };

        if (done !== undefined) {
            where.done = done;
        }

        if (priority !== undefined) {
            where.priority = priority;
        }

        // Add search query
        if (q && q.trim() !== "") {
            const searchTerm = q.trim();
            where.OR = [
                { title: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } }
            ];
        }

        // Query tasks
        const tasks = await prisma.task.findMany({
            where,
            orderBy: [
                { priority: 'asc' },
                { createdAt: 'desc' }
            ],
            take: limit
        });

        return tasks.map(formatTaskForResponse);
    } catch (error) {
        if (error instanceof TaskError) {
            throw error;
        }

        if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
            throw handleValidationError(error);
        }

        throw handleDatabaseError(error);
    }
}


/**
 * Mark a task as done/undone (only if owned by the authenticated user)
 */
export async function toggleTaskDone(id: string, done: boolean): Promise<TaskResponse> {
    try {
        // Get authenticated user
        const userId = await getAuthenticatedUser();

        // Update task - single query instead of updateMany + findUnique
        const task = await prisma.task.update({
            where: { id },
            data: { done }
        });

        // Check ownership after update
        if (task.userId !== userId) {
            throw new TaskError("Task not found", 404);
        }

        return formatTaskForResponse(task);
    } catch (error) {
        if (error instanceof TaskError) {
            throw error;
        }

        throw handleDatabaseError(error);
    }
}


// Simple helper function to format task for response
function formatTaskForResponse(task: Task): TaskResponse {
    return {
        ...task,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    };
}
