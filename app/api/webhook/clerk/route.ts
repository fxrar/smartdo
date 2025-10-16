// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPrimaryEmail(data: any): string {
    try {
        const primaryId = data?.primary_email_address_id;
        const list = (data?.email_addresses ?? []) as Array<{ id: string; email_address: string }>;
        const match = list.find((e) => e.id === primaryId);
        const fallback = list[0]?.email_address ?? data?.email ?? "";
        return (match?.email_address ?? fallback).toLowerCase();
    } catch {
        return "";
    }
}

function getName(data: any): string | null {
    const first = data?.first_name ?? "";
    const last = data?.last_name ?? "";
    const full = `${first} ${last}`.trim();
    return full.length ? full : (data?.username ?? null);
}

export async function POST(req: Request) {
    const body = await req.text();
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
        return new Response("Missing Svix headers", { status: 400 });
    }

    const secret = process.env.CLERK_WEBHOOK_SECRET ?? "";
    const wh = new Webhook(secret);

    try {
        const evt = wh.verify(body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        }) as any;

        if (evt?.type !== "user.created") {
            return new Response("Ignored", { status: 200 });
        }

        const data = evt.data;
        const clerkId: string = data?.id;
        const email: string = getPrimaryEmail(data);
        const name: string | null = getName(data);

        if (!clerkId || !email) {
            return new Response("Invalid user payload", { status: 422 });
        }

        // Create/update user in DB
        const user = await prisma.user.upsert({
            where: { clerkId },
            create: { clerkId, email, name },
            update: { email, name },
        });

        // NEW: Store internal DB user.id in Clerk metadata
        // This caches the ID so future requests don't need DB lookup
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(clerkId, {
            publicMetadata: {
                internal_user_id: user.id // Stores your DB's user.id
            }
        });

        return new Response("ok", { status: 200 });
    } catch (err) {
        console.error("Webhook verification failed or DB error:", err);
        return new Response("Bad signature", { status: 400 });
    }
}
