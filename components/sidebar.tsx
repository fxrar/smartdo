// components/sidebar.tsx - MOBILE RESPONSIVE
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
    LayoutList,
    CalendarDays,
    CalendarClock,
    LayoutGrid,
    Settings,
    Moon,
    Sun,
    MessageSquare,
} from "lucide-react";

import {
    Sidebar as SidebarRoot,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Chat } from "@/features/ai/components/chat";

const mainNavigation = [
    { name: "All", href: "/app", icon: LayoutList },
    { name: "Today", href: "/tasks/today", icon: CalendarDays },
    { name: "Upcoming", href: "/tasks/upcoming", icon: CalendarClock },
];

function AppSidebar({ isChatOpen, toggleChat }: { isChatOpen: boolean; toggleChat: () => void }) {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <SidebarRoot>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/tasks">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <LayoutGrid className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Smart Do</span>
                                    <span className="text-xs text-muted-foreground">Task Manager</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.href}>
                                                <item.icon />
                                                <span>{item.name}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={toggleChat} isActive={isChatOpen}>
                            <MessageSquare />
                            <span>AI Assistant</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {mounted && (
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                                {theme === "dark" ? <Sun /> : <Moon />}
                                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/settings">
                                <Settings />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </SidebarRoot>
    );
}

function MobileHeader() {
    const { isMobile } = useSidebar();

    if (!isMobile) return null;

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shrink-0">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-primary">
                    <LayoutGrid className="size-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-sm">Smart Do</span>
            </div>
        </header>
    );
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
    const [isChatOpen, setIsChatOpen] = React.useState(false);

    return (
        <SidebarProvider>
            <AppSidebar isChatOpen={isChatOpen} toggleChat={() => setIsChatOpen(!isChatOpen)} />
            <main className="flex-1 w-full flex flex-col h-[100dvh] overflow-hidden">
                <MobileHeader />
                <div className="flex-1 flex overflow-hidden min-h-0">
                    {/* Chat Panel - Full width on mobile, 30% on desktop */}
                    <div
                        className={`${isChatOpen ? "w-full lg:w-[30%]" : "w-0"
                            } transition-all duration-300 ease-in-out border-r overflow-hidden flex`}
                    >
                        {isChatOpen && (
                            <div className="w-full">
                                <Chat onClose={() => setIsChatOpen(false)} />
                            </div>
                        )}
                    </div>

                    {/* Main Content - Hidden on mobile when chat open, 70% on desktop */}
                    <div
                        className={`${isChatOpen ? "hidden lg:flex lg:w-[70%]" : "flex w-full"
                            } transition-all duration-300 ease-in-out overflow-y-auto min-h-0`}
                    >
                        <div className="flex-1 w-full">{children}</div>
                    </div>
                </div>
            </main>
        </SidebarProvider>
    );
}
