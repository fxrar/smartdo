// components/dynamic-ui.tsx
"use client";

import { getToolComponent } from "@/features/ai/tools/ui-registry";
import type { Message } from "@ai-sdk/react";

interface DynamicUIProps {
    messages: Message[];
}

export function DynamicUI({ messages }: DynamicUIProps) {
    return (
        <>
            {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                    {message.parts.map((part, index) => {
                        // Render text parts with their own background
                        if (part.type === "text") {
                            return (
                                <div key={index} className="whitespace-pre-wrap break-words px-4 py-2.5 bg-muted rounded-2xl rounded-bl-md text-sm leading-relaxed">
                                    {part.text}
                                </div>
                            );
                        }

                        // Handle tool calls with generative UI
                        if (part.type.startsWith("tool-")) {
                            const toolName = part.type.replace("tool-", "");
                            const ToolComponent = getToolComponent(toolName);

                            if (!ToolComponent) return null;

                            const toolState = part.state;

                            // No wrapper div, no extra spacing
                            return (
                                <ToolComponent
                                    key={index}
                                    input={part.input}
                                    output={part.state === "output-available" ? part.output : undefined}
                                    toolState={toolState}
                                    errorText={part.state === "output-error" ? part.errorText : undefined}
                                />
                            );
                        }

                        return null;
                    })}
                </div>
            ))}
        </>
    );
}
