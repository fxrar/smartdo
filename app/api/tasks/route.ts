import { NextRequest, NextResponse } from "next/server";
import { createTask, getTasks } from "@/features/tasks/actions";
import { TaskError } from "@/features/tasks/utils";
import { CreateTaskInput, TaskFilters } from "@/features/tasks/types";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const filters: TaskFilters = {
            done: searchParams.get("done") === "true" ? true : searchParams.get("done") === "false" ? false : undefined,
            q: searchParams.get("q") || undefined,
            limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
        };

        const tasks = await getTasks(filters);

        return NextResponse.json({ success: true, data: tasks });
    } catch (error) {
        console.error("GET /api/tasks error:", error);

        if (error instanceof TaskError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: error.statusCode }
            );
        }

        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Convert string dates to Date objects for validation
        const processedData = {
            ...body,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        };

        const taskData: CreateTaskInput = processedData;

        const task = await createTask(taskData);

        return NextResponse.json({ success: true, data: task }, { status: 201 });
    } catch (error) {
        console.error("POST /api/tasks error:", error);

        if (error instanceof TaskError) {
            return NextResponse.json(
                { success: false, error: error.message, details: error instanceof Error && 'details' in error ? error.details : undefined },
                { status: error.statusCode }
            );
        }

        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}