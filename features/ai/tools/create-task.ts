import { tool } from "ai";
import { z } from "zod";
import { createTask } from "@/features/tasks/actions";

/**
 * AI SDK tool for creating tasks
 * This tool can be passed to generateText or streamText for AI agents
 */
export const createTaskTool = tool({
    description:
        "Create a new task for the authenticated user. Use this tool when the user wants to add a new task, todo item, or reminder to their task list.",

    inputSchema: z.object({
        title: z.string().describe("The title or name of the task"),
        description: z.string().optional().describe("Optional detailed description of the task"),
        done: z.boolean().optional().describe("Whether the task is completed. Defaults to false"),
        dueDate: z.string().optional().describe("Optional due date for the task in ISO 8601 format (e.g., '2025-10-20T10:00:00Z')"),
    }),

    execute: async ({ title, description, done, dueDate }) => {
        try {
            const task = await createTask({
                title,
                description,
                done,
                dueDate: dueDate ? new Date(dueDate) : undefined,
            });

            return {
                success: true,
                message: `Task "${task.title}" created successfully`,
                task: {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    done: task.done,
                    dueDate: task.dueDate,
                    createdAt: task.createdAt,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to create task",
                error: error instanceof Error ? error.name : "UnknownError",
            };
        }
    },
});
