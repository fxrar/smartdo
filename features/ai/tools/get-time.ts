// features/ai/tools/get-time.ts
import { tool } from "ai";
import { z } from "zod";

export const getTimeTool = tool({
    description: "Use this tool to get current time or future/past time. Supports offsets like days, hours, weeks, etc.",
    parameters: z.object({
        offset: z.object({
            days: z.number().optional().describe("Number of days to offset (positive for future, negative for past)"),
            hours: z.number().optional().describe("Number of hours to offset"),
            minutes: z.number().optional().describe("Number of minutes to offset"),
            weeks: z.number().optional().describe("Number of weeks to offset"),
            months: z.number().optional().describe("Number of months to offset"),
        }).optional().describe("Time offset from current time. Leave empty for current time."),
        format: z.enum(["full", "date", "time", "relative"]).optional().default("full").describe("Format of the output: full (date + time), date only, time only, or relative (e.g., 'in 2 days')"),
    }),
    execute: async ({ offset, format = "full" }) => {
        const now = new Date();
        const targetDate = new Date(now);

        // Apply offsets if provided
        if (offset) {
            if (offset.minutes) targetDate.setMinutes(targetDate.getMinutes() + offset.minutes);
            if (offset.hours) targetDate.setHours(targetDate.getHours() + offset.hours);
            if (offset.days) targetDate.setDate(targetDate.getDate() + offset.days);
            if (offset.weeks) targetDate.setDate(targetDate.getDate() + (offset.weeks * 7));
            if (offset.months) targetDate.setMonth(targetDate.getMonth() + offset.months);
        }

        // Format output based on requested format
        let result: string;

        switch (format) {
            case "date":
                result = targetDate.toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Kolkata"
                });
                break;

            case "time":
                result = targetDate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "Asia/Kolkata"
                });
                break;

            case "relative":
                result = getRelativeTime(now, targetDate);
                break;

            case "full":
            default:
                result = targetDate.toLocaleString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "Asia/Kolkata"
                });
                break;
        }

        return {
            timestamp: targetDate.toISOString(),
            formatted: result,
            timezone: "Asia/Kolkata (IST)",
        };
    },
});

// Helper function to generate relative time strings
function getRelativeTime(from: Date, to: Date): string {
    const diffMs = to.getTime() - from.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMs === 0) return "now";

    const isPast = diffMs < 0;
    const prefix = isPast ? "" : "in ";
    const suffix = isPast ? " ago" : "";

    const absDiffSecs = Math.abs(diffSecs);
    const absDiffMins = Math.abs(diffMins);
    const absDiffHours = Math.abs(diffHours);
    const absDiffDays = Math.abs(diffDays);
    const absDiffWeeks = Math.abs(diffWeeks);
    const absDiffMonths = Math.abs(diffMonths);

    if (absDiffMonths > 0) return `${prefix}${absDiffMonths} month${absDiffMonths > 1 ? 's' : ''}${suffix}`;
    if (absDiffWeeks > 0) return `${prefix}${absDiffWeeks} week${absDiffWeeks > 1 ? 's' : ''}${suffix}`;
    if (absDiffDays > 0) return `${prefix}${absDiffDays} day${absDiffDays > 1 ? 's' : ''}${suffix}`;
    if (absDiffHours > 0) return `${prefix}${absDiffHours} hour${absDiffHours > 1 ? 's' : ''}${suffix}`;
    if (absDiffMins > 0) return `${prefix}${absDiffMins} minute${absDiffMins > 1 ? 's' : ''}${suffix}`;
    return `${prefix}${absDiffSecs} second${absDiffSecs > 1 ? 's' : ''}${suffix}`;
}
