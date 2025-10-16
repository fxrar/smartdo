// features/ai/components/chat.tsx
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

    const { messages, sendMessage, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
    });

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, status]);

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
            <div className="flex items-center justify-between border-b px-3 sm:px-4 py-3 sm:py-3.5 shrink-0 bg-background">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                        <div className="size-7 sm:size-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="size-3.5 sm:size-4 text-primary" />
                        </div>
                        <div className="absolute bottom-0 right-0 size-1.5 sm:size-2 rounded-full bg-green-500 ring-2 ring-background" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xs sm:text-sm font-semibold truncate">Task Assistant</h2>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            Always here to help
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-3 sm:px-4">
                <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                            <div className="mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-primary/5 p-3 sm:p-4 ring-1 ring-primary/10">
                                <Sparkles className="size-6 sm:size-8 text-primary" />
                            </div>
                            <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-1.5">
                                Your AI Task Assistant
                            </h3>
                            <p className="text-[10px] sm:text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                                Ask me to create, organize, or manage your tasks using natural
                                language
                            </p>
                            <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                                {[
                                    "Create a task for tomorrow",
                                    "Show my pending tasks",
                                    "Organize by priority",
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
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
                                "flex gap-2 sm:gap-2.5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                                message.role === "user" && "justify-end"
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {message.role === "assistant" && (
                                <Avatar className="size-6 sm:size-8 shrink-0">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] sm:text-xs">
                                        <Sparkles className="size-3 sm:size-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}

                            <div
                                className={cn(
                                    "rounded-xl sm:rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 max-w-[85%] transition-all",
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-br-sm sm:rounded-br-md"
                                        : "bg-muted rounded-bl-sm sm:rounded-bl-md"
                                )}
                            >
                                {message.parts
                                    .filter((part) => part.type === "text")
                                    .map((part, i) => (
                                        <p
                                            key={i}
                                            className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words"
                                        >
                                            {part.text}
                                        </p>
                                    ))}
                            </div>

                            {message.role === "user" && (
                                <Avatar className="size-6 sm:size-8 shrink-0">
                                    <AvatarImage src={USER_AVATAR} alt="User" />
                                    <AvatarFallback className="bg-muted text-[10px] sm:text-xs font-medium">
                                        You
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-2 sm:gap-2.5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                            <Avatar className="size-6 sm:size-8 shrink-0">
                                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] sm:text-xs">
                                    <Sparkles className="size-3 sm:size-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl rounded-bl-sm sm:rounded-bl-md bg-muted px-2.5 sm:px-3.5 py-2 sm:py-2.5">
                                <div className="flex gap-0.5 sm:gap-1">
                                    <div className="size-1 sm:size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                                    <div className="size-1 sm:size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                                    <div className="size-1 sm:size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                                </div>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">Thinking</span>
                            </div>
                        </div>
                    )}

                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-2 sm:p-3 shrink-0 bg-background">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-1.5 sm:gap-2 items-end">
                        <div className="flex-1 relative">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                className="min-h-[44px] sm:min-h-[48px] max-h-[100px] sm:max-h-[120px] resize-none text-xs sm:text-sm pr-10 sm:pr-12 rounded-lg sm:rounded-xl"
                                disabled={status !== "ready"}
                                rows={1}
                            />
                            <div className="absolute bottom-2 right-2 text-[10px] sm:text-xs text-muted-foreground">
                                {input.length > 0 && (
                                    <span className="animate-in fade-in-0 duration-200">
                                        {input.length}
                                    </span>
                                )}
                            </div>
                        </div>

                        {status === "ready" ? (
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim()}
                                className={cn(
                                    "size-11 sm:size-12 shrink-0 rounded-lg sm:rounded-xl transition-all duration-200",
                                    input.trim()
                                        ? "scale-100 opacity-100"
                                        : "scale-95 opacity-50"
                                )}
                            >
                                <Send className="size-3.5 sm:size-4" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={stop}
                                className="size-11 sm:size-12 shrink-0 rounded-lg sm:rounded-xl"
                            >
                                <StopCircle className="size-3.5 sm:size-4" />
                            </Button>
                        )}
                    </div>
                </form>
                <p className="text-[9px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 text-center hidden sm:block">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
