import { NextRequest, NextResponse } from "next/server";
import { updateTask, deleteTask, getTask } from "@/features/tasks/actions";
import { TaskError } from "@/features/tasks/utils";
import { UpdateTaskInput } from "@/features/tasks/types";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const task = await getTask(params.id);
        return NextResponse.json({ success: true, data: task });
    } catch (error) {
        console.error(`GET /api/tasks/${params.id} error:`, error);

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

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        // Convert string dates to Date objects for validation
        const processedData = {
            ...body,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        };

        const updateData: UpdateTaskInput = processedData;

        const updatedTask = await updateTask(params.id, updateData);
        return NextResponse.json({ success: true, data: updatedTask });
    } catch (error) {
        console.error(`PATCH /api/tasks/${params.id} error:`, error);

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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await deleteTask(params.id);
        return NextResponse.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        console.error(`DELETE /api/tasks/${params.id} error:`, error);

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