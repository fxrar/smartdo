"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef } from "react";
import { Send, Loader2, StopCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatProps {
    onClose?: () => void;
}

const USER_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=https%3A%2F%2Fyoda.hypeople.studio%2Fyoda-admin-template%2Freact%2Fstatic%2Fmedia%2Fmemoji-1.afa5922f.png&f=y";

export function Chat({ onClose }: ChatProps) {
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
    });

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages, status]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
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
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-3 md:px-4 py-2.5 md:py-3 shrink-0 bg-background">
                <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                        <div className="size-8 md:size-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="size-4 md:size-4.5 text-primary" />
                        </div>
                        <div className="absolute bottom-0 right-0 size-2 rounded-full bg-green-500 ring-2 ring-background" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm md:text-base font-semibold truncate">Task Assistant</h2>
                        <p className="text-xs text-muted-foreground truncate">
                            Always here to help
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages - Fixed Height ScrollArea */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full px-3 md:px-4 lg:px-6">
                    <div className="space-y-3 md:space-y-4 py-3 md:py-4 max-w-4xl mx-auto">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 md:py-12 lg:py-16 text-center px-4">
                                <div className="mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-primary/5 p-3 md:p-4 ring-1 ring-primary/10">
                                    <Sparkles className="size-7 md:size-8 lg:size-10 text-primary" />
                                </div>
                                <h3 className="text-sm md:text-base font-semibold mb-1 md:mb-2">
                                    Your AI Task Assistant
                                </h3>
                                <p className="text-xs md:text-sm text-muted-foreground max-w-sm leading-relaxed">
                                    Ask me to create, organize, or manage your tasks using natural
                                    language
                                </p>
                                <div className="mt-4 md:mt-6 flex flex-wrap gap-2 justify-center max-w-md">
                                    {[
                                        "Create a task for tomorrow",
                                        "Show my pending tasks",
                                        "Organize by priority",
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setInput(suggestion)}
                                            className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-2 md:gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                                    message.role === "user" && "justify-end"
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {message.role === "assistant" && (
                                    <Avatar className="size-7 md:size-8 shrink-0 mt-1">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                            <Sparkles className="size-3.5 md:size-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={cn(
                                        "rounded-2xl px-3 md:px-4 py-2 md:py-2.5 max-w-[85%] md:max-w-[75%] transition-all",
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-br-md"
                                            : "bg-muted rounded-bl-md"
                                    )}
                                >
                                    {message.parts
                                        .filter((part) => part.type === "text")
                                        .map((part, i) => (
                                            <p
                                                key={i}
                                                className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words"
                                            >
                                                {part.text}
                                            </p>
                                        ))}
                                </div>

                                {message.role === "user" && (
                                    <Avatar className="size-7 md:size-8 shrink-0 mt-1">
                                        <AvatarImage src={USER_AVATAR} alt="User" />
                                        <AvatarFallback className="bg-muted text-xs font-medium">
                                            You
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-2 md:gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                                <Avatar className="size-7 md:size-8 shrink-0 mt-1">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        <Sparkles className="size-3.5 md:size-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-3 md:px-4 py-2 md:py-2.5">
                                    <div className="flex gap-1">
                                        <div className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                                        <div className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                                        <div className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                                    </div>
                                    <span className="text-xs md:text-sm text-muted-foreground">Thinking</span>
                                </div>
                            </div>
                        )}

                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input */}
            <div className="border-t p-2 md:p-3 lg:p-4 shrink-0 bg-background">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                className="min-h-[48px] md:min-h-[52px] max-h-[120px] md:max-h-[150px] resize-none text-sm md:text-base pr-12 rounded-xl"
                                disabled={status !== "ready"}
                                rows={1}
                            />
                            {input.length > 0 && (
                                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground animate-in fade-in-0 duration-200">
                                    {input.length}
                                </div>
                            )}
                        </div>

                        {status === "ready" ? (
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim()}
                                className={cn(
                                    "size-12 md:size-[52px] shrink-0 rounded-xl transition-all duration-200",
                                    input.trim()
                                        ? "scale-100 opacity-100"
                                        : "scale-95 opacity-50"
                                )}
                            >
                                <Send className="size-4 md:size-5" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={stop}
                                className="size-12 md:size-[52px] shrink-0 rounded-xl"
                            >
                                <StopCircle className="size-4 md:size-5" />
                            </Button>
                        )}
                    </div>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center hidden md:block max-w-4xl mx-auto">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
