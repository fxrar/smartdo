// features/ai/components/chat.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Send, Loader2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatProps {
    onClose?: () => void;
}

export function Chat({ onClose }: ChatProps) {
    const [input, setInput] = useState("");

    const { messages, sendMessage, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (input.trim() && status === "ready") {
            sendMessage({ text: input });
            setInput("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-green-500" />
                    <h2 className="text-sm font-semibold">Task Assistant</h2>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4">
                <div className="space-y-6 py-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <div className="mb-3 rounded-full bg-primary/10 p-4">
                                <svg className="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold mb-1">Task Assistant</h3>
                            <p className="text-xs text-muted-foreground">
                                Manage tasks with natural language
                            </p>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div key={message.id} className={cn("flex gap-2", message.role === "user" && "justify-end")}>
                            {message.role === "assistant" && (
                                <Avatar className="size-7">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
                                </Avatar>
                            )}

                            <div className={cn("rounded-lg px-3 py-2 max-w-[85%]", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                {message.parts
                                    .filter(part => part.type === "text")
                                    .map((part, i) => (
                                        <p key={i} className="text-sm whitespace-pre-wrap">
                                            {part.text}
                                        </p>
                                    ))}
                            </div>

                            {message.role === "user" && (
                                <Avatar className="size-7">
                                    <AvatarFallback className="text-xs">You</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}

                    {(status === "submitted" || status === "streaming") && (
                        <div className="flex gap-2">
                            <Avatar className="size-7">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                                <Loader2 className="size-3 animate-spin" />
                                <span className="text-xs">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-3 shrink-0">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            className="min-h-[48px] resize-none text-sm"
                            disabled={status !== "ready"}
                            rows={1}
                        />

                        {status === "ready" ? (
                            <Button
                                type="submit"
                                size="icon"
                                disabled={status !== "ready" || !input.trim()}
                                className="size-12 shrink-0"
                            >
                                <Send className="size-4" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={stop}
                                className="size-12 shrink-0"
                            >
                                <StopCircle className="size-4" />
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}
