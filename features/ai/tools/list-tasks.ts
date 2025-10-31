import { tool } from "ai";
import { z } from "zod";
import { getTasks } from "@/features/tasks/actions";

/**
 * AI SDK tool for listing tasks
 * This tool can be passed to generateText or streamText for AI agents
 */
export const listTasksTool = tool({
    description:
        "Get a list of tasks for the authenticated user. Use this tool when the user wants to see their tasks, view their todo list, or search for specific tasks.",

    parameters: z.object({
        done: z
            .boolean()
            .optional()
            .describe("Filter tasks by completion status. True for completed tasks, false for incomplete tasks. Leave undefined to show all tasks"),
        q: z
            .string()
            .optional()
            .describe("Search query to filter tasks by title or description"),
        limit: z
            .number()
            .optional()
            .describe("Maximum number of tasks to return. Defaults to 50"),
        priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE']).optional().describe("Filter tasks by priority level"),
    }),

    execute: async ({ done, q, limit, priority }) => {
        try {
            const tasks = await getTasks({ done, q, limit, priority });

            return {
                success: true,
                message: `Found ${tasks.length} task(s)`,
                tasks: tasks.map((task) => ({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    done: task.done,
                    dueDate: task.dueDate,
                    priority: task.priority,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt,
                })),
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to fetch tasks",
                error: error instanceof Error ? error.name : "UnknownError",
            };
        }
    },
});
