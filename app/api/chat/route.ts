import { convertToModelMessages } from "ai";
import { taskAgent } from "@/features/ai/agent";

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Convert UIMessages to ModelMessages - critical for tool execution
    const modelMessages = convertToModelMessages(messages);

    const result = await taskAgent(modelMessages);

    // Use toUIMessageStreamResponse() for proper tool handling
    return result.toUIMessageStreamResponse();
}
