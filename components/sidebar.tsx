// components/sidebar.tsx - MOBILE RESPONSIVE WITH CUSTOM ACCOUNT
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import {
    LayoutList,
    CalendarDays,
    CalendarClock,
    LayoutGrid,
    Moon,
    Sun,
    MessageSquare,
    LogOut,
    User,
    ChevronDown,
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

function AccountDropdown() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSignOut = async () => {
        await signOut({ redirectUrl: "/" });
    };

    if (!user) return null;

    const userInitials = user.firstName
        ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ""}`
        : "U";

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
            >
                <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0">
                    {userInitials}
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                        {user.firstName || user.emailAddresses[0]?.emailAddress?.split("@")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {user.emailAddresses[0]?.emailAddress}
                    </p>
                </div>
                <ChevronDown className="size-4 flex-shrink-0 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-md shadow-lg z-50 min-w-[200px]">
                    <Link
                        href="/account"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-accent text-sm transition-colors border-b"
                    >
                        <User className="size-4" />
                        <span>Account Settings</span>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-accent text-sm text-destructive hover:text-destructive transition-colors"
                    >
                        <LogOut className="size-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    );
}

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
                        <AccountDropdown />
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
