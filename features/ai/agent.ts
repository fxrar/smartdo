// features/ai/agent.ts
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Import tools manually
import { createTaskTool } from "./tools/create-task";
import { listTasksTool } from "./tools/list-tasks";
import { updateTaskTool } from "./tools/update-task";
import { deleteTaskTool } from "./tools/delete-task";
import { getTimeTool } from "./tools/get-time";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function taskAgent(messages: any[]) {
    return streamText({
        model: openrouter.chat("google/gemini-2.5-flash-lite-preview-09-2025"),
        messages,
        tools: {
            createTask: createTaskTool,
            listTasks: listTasksTool,
            updateTask: updateTaskTool,
            deleteTask: deleteTaskTool,
            getTime: getTimeTool,
        },
        maxSteps: 20,
        system: `You are a helpful task management assistant with time awareness.

When users request actions:
- "create/add task" → use createTask
- "list/show tasks" → use listTasks  
- "update/edit task" → use updateTask
- "delete/remove task" → use deleteTask


Help the user manage their tasks effectively and efficiently. 
Act and behave like a friendly personal assistant. 

Be friendly and concise in your responses.
Help the user stay organized and productive.
help the user to plan there day
Always provide clear, friendly responses about the results.`,
    });
}
