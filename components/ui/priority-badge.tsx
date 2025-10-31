import { cn } from "@/lib/utils";
import { Priority } from "@/features/tasks/types";

interface PriorityBadgeProps {
    priority: Priority;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const priorityConfig = {
    URGENT: {
        color: 'bg-red-500 text-white',
        label: 'Urgent'
    },
    HIGH: {
        color: 'bg-orange-500 text-white',
        label: 'High'
    },
    MEDIUM: {
        color: 'bg-amber-500 text-white',
        label: 'Medium'
    },
    LOW: {
        color: 'bg-blue-500 text-white',
        label: 'Low'
    },
    NONE: {
        color: 'bg-gray-500 text-white',
        label: 'None'
    }
};

const sizeClasses = {
    sm: 'w-2 h-2 text-xs',
    md: 'w-3 h-3 text-xs',
    lg: 'w-4 h-4 text-sm'
};

export function PriorityBadge({ priority, size = 'md', showLabel = false }: PriorityBadgeProps) {
    const config = priorityConfig[priority];
    const sizeClass = sizeClasses[size];

    if (showLabel) {
        return (
            <span className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                config.color
            )}>
                <span className={cn('rounded-full', sizeClass)} />
                {config.label}
            </span>
        );
    }

    return (
        <span className={cn(
            'inline-block rounded-full',
            config.color,
            sizeClass
        )} />
    );
}