"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
    Inbox,
    CalendarDays,
    CalendarClock,
    LayoutGrid,
    Settings,
    Moon,
    Sun,
} from "lucide-react";

import {
    Sidebar as SidebarRoot,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const mainNavigation = [
    { name: "Inbox", href: "/tasks", icon: Inbox, count: 12 },
    { name: "Today", href: "/tasks/today", icon: CalendarDays, count: 5 },
    { name: "Upcoming", href: "/tasks/upcoming", icon: CalendarClock, count: 8 },
];

const projects = [
    { name: "Personal", href: "/projects/personal", count: 7 },
    { name: "Work", href: "/projects/work", count: 12 },
    { name: "Shopping List", href: "/projects/shopping", count: 3 },
];

function AppSidebar() {
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
                                                {item.count > 0 && (
                                                    <Badge variant="secondary" className="ml-auto">
                                                        {item.count}
                                                    </Badge>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>My Projects</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {projects.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.href}>
                                                <div className="size-2 rounded-full bg-blue-500" />
                                                <span>{item.name}</span>
                                                {item.count > 0 && (
                                                    <span className="ml-auto text-xs text-muted-foreground">
                                                        {item.count}
                                                    </span>
                                                )}
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
        <>
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-md bg-primary">
                        <LayoutGrid className="size-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-sm">Smart Do</span>
                </div>
            </header>
        </>
    );
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 w-full flex flex-col">
                <MobileHeader />
                <div className="flex-1">{children}</div>
            </main>
        </SidebarProvider>
    );
}
