"use client";

import { Priority } from "../types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PrioritySelectorProps {
    value?: Priority;
    onChange?: (priority: Priority) => void;
    disabled?: boolean;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; badgeVariant: "default" | "secondary" | "destructive" | "outline" }> = {
    IMPORTANT: {
        label: "Important",
        color: "text-red-600 dark:text-red-400",
        badgeVariant: "destructive",
    },
    HIGH: {
        label: "High",
        color: "text-orange-600 dark:text-orange-400",
        badgeVariant: "default",
    },
    MEDIUM: {
        label: "Medium",
        color: "text-yellow-600 dark:text-yellow-400",
        badgeVariant: "secondary",
    },
    NORMAL: {
        label: "Normal",
        color: "text-gray-600 dark:text-gray-400",
        badgeVariant: "outline",
    },
};

export function PrioritySelector({ value, onChange, disabled }: PrioritySelectorProps) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                    <SelectItem key={priority} value={priority}>
                        <div className="flex items-center gap-2">
                            <Badge variant={config.badgeVariant} className="h-5 px-2">
                                {config.label}
                            </Badge>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
    const config = PRIORITY_CONFIG[priority];

    return (
        <Badge variant={config.badgeVariant} className={`${config.color} font-medium`}>
            {config.label}
        </Badge>
    );
}

export { PRIORITY_CONFIG };