// features/ai/tools/ui-registry.tsx
"use client";

import type { ComponentType } from "react";

// Import UI components only
import { ListTasksUI } from "./ui/list-tasks-ui";
import { CreateTaskUI } from "./ui/create-task-ui";

// Define UI component props interface
export interface ToolUIComponentProps<TInput = any, TOutput = any> {
    input?: TInput;
    output?: TOutput;
    toolState: "input-streaming" | "input-available" | "output-available" | "output-error";
    errorText?: string;
}

// UI Registry - only components, no tool definitions
export const uiRegistry = {
    listTasks: ListTasksUI,
    createTask: CreateTaskUI,
    // Add more UI components here as needed
    // updateTask: UpdateTaskUI,
    // deleteTask: DeleteTaskUI,
} as const;

// Helper to get UI component for tool
export function getToolComponent(toolName: string): ComponentType<ToolUIComponentProps> | undefined {
    return uiRegistry[toolName as keyof typeof uiRegistry];
}

// Helper to check if tool has generative UI
export function hasGenerativeUI(toolName: string): boolean {
    return toolName in uiRegistry;
}
