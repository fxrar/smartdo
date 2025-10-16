import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";

// Error types for consistent error handling
export class TaskError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = "TaskError";
    }
}

export class ValidationError extends TaskError {
    constructor(message: string, public details?: any) {
        super(message, 400, "VALIDATION_ERROR");
        this.name = "ValidationError";
    }
}

export class AuthenticationError extends TaskError {
    constructor(message: string = "Authentication required") {
        super(message, 401, "AUTHENTICATION_ERROR");
        this.name = "AuthenticationError";
    }
}

export class NotFoundError extends TaskError {
    constructor(message: string = "Resource not found") {
        super(message, 404, "NOT_FOUND_ERROR");
        this.name = "NotFoundError";
    }
}

// Get authenticated user from Clerk and resolve to internal User ID
export async function getAuthenticatedUser(): Promise<string> {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            throw new AuthenticationError();
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { id: true }
        });

        if (!user) {
            throw new AuthenticationError("User not found in database");
        }

        return user.id;
    } catch (error) {
        console.log(error)
        if (error instanceof TaskError) {
            throw error;
        }
        throw new AuthenticationError("Failed to authenticate user");
    }
}

// Handle Zod validation errors
export function handleValidationError(error: unknown): ValidationError {
    if (error instanceof ZodError) {
        const details = error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));
        return new ValidationError("Validation failed", details);
    }
    return new ValidationError("Invalid input");
}

// Handle database errors and convert to appropriate TaskError
export function handleDatabaseError(error: unknown): TaskError {
    console.error("Database error:", error);

    // Prisma unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return new ValidationError("Resource already exists");
    }

    // Prisma record not found
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return new NotFoundError("Record not found");
    }

    // Generic database error
    return new TaskError("Database operation failed");
}