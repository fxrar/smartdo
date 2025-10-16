import { tool } from "ai";
import { z } from "zod";
import { updateTask } from "@/features/tasks/actions";

/**
 * AI SDK tool for updating tasks
 * This tool can be passed to generateText or streamText for AI agents
 */
export const updateTaskTool = tool({
    description:
        "Update an existing task for the authenticated user. Use this tool when the user wants to modify task details, change the title, description, completion status, or due date.",

    parameters: z.object({
        id: z.string().describe("The unique ID of the task to update"),
        title: z.string().optional().describe("New title for the task"),
        description: z
            .string()
            .optional()
            .describe("New description for the task"),
        done: z
            .boolean()
            .optional()
            .describe("New completion status for the task"),
        dueDate: z
            .string()
            .optional()
            .describe("New due date in ISO 8601 format (e.g., '2025-10-20T10:00:00Z')"),
    }),

    execute: async ({ id, title, description, done, dueDate }) => {
        try {
            const task = await updateTask(id, {
                title,
                description,
                done,
                dueDate: dueDate ? new Date(dueDate) : undefined,
            });

            return {
                success: true,
                message: `Task "${task.title}" updated successfully`,
                task: {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    done: task.done,
                    dueDate: task.dueDate,
                    updatedAt: task.updatedAt,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to update task",
                error: error instanceof Error ? error.name : "UnknownError",
            };
        }
    },
});
