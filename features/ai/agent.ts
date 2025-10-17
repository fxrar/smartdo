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
        model: openrouter.chat("x-ai/grok-code-fast-1"),
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
- "what time/date/day is it" or "time in X days" → use getTime

For time queries, intelligently parse user requests like:
- "what time is it" → no offset
- "what time will it be in 2 days" → {days: 2}
- "date next week" → {weeks: 1}
- "time 3 hours from now" → {hours: 3}

Always provide clear, friendly responses about the results.`,
    });
}
