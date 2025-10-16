import { tool } from "ai";
import { z } from "zod";
import { deleteTask } from "@/features/tasks/actions";

/**
 * AI SDK tool for deleting tasks
 * This tool can be passed to generateText or streamText for AI agents
 */
export const deleteTaskTool = tool({
    description:
        "Delete a task for the authenticated user. Use this tool when the user wants to remove or delete a task from their list.",

    parameters: z.object({
        id: z.string().describe("The unique ID of the task to delete"),
    }),

    execute: async ({ id }) => {
        try {
            await deleteTask(id);

            return {
                success: true,
                message: `Task deleted successfully`,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to delete task",
                error: error instanceof Error ? error.name : "UnknownError",
            };
        }
    },
});
