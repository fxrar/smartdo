"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Inbox,
    CalendarDays,
    CalendarClock,
    LayoutGrid,
    Settings,
    ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
}

const mainNavigation: NavItem[] = [
    { name: "Inbox", href: "/tasks", icon: Inbox, count: 12 },
    { name: "Today", href: "/tasks/today", icon: CalendarDays, count: 5 },
    { name: "Upcoming", href: "/tasks/upcoming", icon: CalendarClock, count: 8 },
];

const sections = [
    {
        title: "My Projects",
        items: [
            { name: "Personal", href: "/projects/personal", count: 7 },
            { name: "Work", href: "/projects/work", count: 12 },
            { name: "Shopping List", href: "/projects/shopping", count: 3 },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-background flex flex-col">
            {/* Header */}
            <div className="h-14 flex items-center px-4 border-b">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                        <LayoutGrid className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-sm">Smart Do</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
                {/* Main Navigation */}
                <nav className="px-2 space-y-0.5">
                    {mainNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors group",
                                    isActive
                                        ? "bg-accent text-foreground font-medium"
                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                <span className="flex-1">{item.name}</span>
                                {item.count !== undefined && item.count > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "h-5 px-1.5 text-xs font-medium",
                                            isActive ? "bg-background/50" : "bg-transparent"
                                        )}
                                    >
                                        {item.count}
                                    </Badge>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Projects Section */}
                <div className="mt-6">
                    {sections.map((section) => (
                        <div key={section.title} className="px-2">
                            <div className="flex items-center justify-between px-2.5 py-1.5 mb-1">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {section.title}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 hover:bg-accent"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <nav className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors",
                                                isActive
                                                    ? "bg-accent text-foreground font-medium"
                                                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                            )}
                                        >
                                            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                            <span className="flex-1 truncate">{item.name}</span>
                                            {item.count !== undefined && item.count > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    {item.count}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t p-2">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                </Link>
            </div>
        </aside>
    );
}
