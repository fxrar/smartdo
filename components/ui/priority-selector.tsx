import { cn } from "@/lib/utils";
import { Priority } from "@/features/tasks/types";
import { PriorityBadge } from "./priority-badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PrioritySelectorProps {
    value: Priority;
    onChange: (priority: Priority) => void;
    disabled?: boolean;
}

const priorityOptions = [
    { value: 'NONE' as Priority, label: 'None' },
    { value: 'LOW' as Priority, label: 'Low' },
    { value: 'MEDIUM' as Priority, label: 'Medium' },
    { value: 'HIGH' as Priority, label: 'High' },
    { value: 'URGENT' as Priority, label: 'Urgent' },
];

export function PrioritySelector({ value, onChange, disabled = false }: PrioritySelectorProps) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                    <PriorityBadge priority={value} size="sm" />
                    <SelectValue placeholder="Select priority" />
                </div>
            </SelectTrigger>
            <SelectContent>
                {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                            <PriorityBadge priority={option.value} size="sm" />
                            <span>{option.label}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}