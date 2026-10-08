import { manualAction, adminError } from "@/lib/ai-cms/manual";
import { z } from "zod";
import { NextResponse } from "next/server";
const statusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "ready",
    "delivered",
    "cancelled",
  ]),
});
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    z.string().uuid().parse(id);
    const body = statusSchema.parse(await request.json());
    return NextResponse.json(await manualAction("orders", "update", body, id));
  } catch (error) {
    return adminError(error);
  }
}
export async function DELETE() {
  return NextResponse.json(
    {
      error:
        "Keep order history for inventory and records. Cancel the order instead.",
    },
    { status: 405 },
  );
}
