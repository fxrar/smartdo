"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef } from "react";
import { Send, Loader2, StopCircle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DynamicUI } from "./dynamic-ui";

interface ChatProps {
    onClose?: () => void;
}

const USER_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=https%3A%2F%2Fyoda.hypeople.studio%2Fyoda-admin-template%2Freact%2Fstatic%2Fmedia%2Fmemoji-1.afa5922f.png&f=y";

export function Chat({ onClose }: ChatProps) {
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { messages, sendMessage, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages, status]);

    useEffect(() => {
        if (textareaRef.current) {
            if (input) {
                textareaRef.current.style.height = "auto";
                const scrollHeight = textareaRef.current.scrollHeight;
                textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
            } else {
                // Reset to minimum height when empty
                textareaRef.current.style.height = "";
            }
        }
    }, [input]);

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

    const isLoading = status === "submitted" || status === "streaming";

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative shrink-0">
                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="size-4.5 text-primary" />
                        </div>
                        <div className="absolute bottom-0 right-0 size-2 rounded-full bg-green-500 ring-2 ring-background" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold truncate">AI Assistant</h2>
                        <p className="text-xs text-muted-foreground truncate">
                            Always here to help
                        </p>
                    </div>
                </div>

                {/* Close button - visible only on small screens */}
                {onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="lg:hidden shrink-0"
                    >
                        <X className="size-5" />
                    </Button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full px-4">
                    <div className="space-y-4 py-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                <div className="mb-4 rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/10">
                                    <Sparkles className="size-10 text-primary" />
                                </div>
                                <h3 className="text-base font-semibold mb-2">
                                    Your AI Task Assistant
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                                    Ask me to create, organize, or manage your tasks
                                </p>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                                    message.role === "user" && "justify-end"
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {message.role === "assistant" && (
                                    <Avatar className="size-8 shrink-0 mt-1">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                            <Sparkles className="size-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={cn(
                                        "rounded-2xl transition-all",
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-br-md px-4 py-2.5 max-w-[85%]"
                                            : "w-full"
                                    )}
                                >
                                    {message.role === "user" ? (
                                        // User messages - simple text display
                                        message.parts
                                            .filter((part) => part.type === "text")
                                            .map((part, i) => (
                                                <p
                                                    key={i}
                                                    className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                                                >
                                                    {part.text}
                                                </p>
                                            ))
                                    ) : (
                                        // Assistant messages - render DynamicUI directly
                                        <DynamicUI messages={[message]} />
                                    )}

                                </div>

                                {message.role === "user" && (
                                    <Avatar className="size-8 shrink-0 mt-1">
                                        <AvatarImage src={USER_AVATAR} alt="User" />
                                        <AvatarFallback className="bg-muted text-xs font-medium">
                                            You
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <Avatar className="size-8 shrink-0 mt-1">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        <Sparkles className="size-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
                                    <div className="flex gap-1">
                                        <div className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                                        <div className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                                        <div className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                                    </div>
                                    <span className="text-sm text-muted-foreground">Thinking</span>
                                </div>
                            </div>
                        )}

                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input */}
            <div className="border-t p-4 shrink-0">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                className="min-h-[44px] max-h-[150px] resize-none text-base rounded-xl md:min-h-[52px]"
                                disabled={status !== "ready"}
                                rows={1}
                            />
                        </div>

                        {status === "ready" ? (
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim()}
                                className="size-[44px] shrink-0 rounded-xl md:size-[52px]"
                            >
                                <Send className="size-4.5 md:size-5" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={stop}
                                className="size-[44px] shrink-0 rounded-xl md:size-[52px]"
                            >
                                <StopCircle className="size-4.5 md:size-5" />
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
