import { NextResponse } from "next/server";
import { aiActionSchema } from "@/lib/ai-cms/types";
import { manualAction, manualActions, adminError } from "@/lib/ai-cms/manual";
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 1024 * 1024)
      return NextResponse.json(
        { error: "Changes must be smaller than 1 MB" },
        { status: 413 },
      );
    const body = JSON.parse(raw);
    if (Array.isArray(body))
      return NextResponse.json(await manualActions(body));
    const action = aiActionSchema.parse(body);
    return NextResponse.json(
      await manualAction(
        action.resource,
        action.operation,
        action.changes,
        action.targetId,
      ),
    );
  } catch (error) {
    return adminError(error);
  }
}
