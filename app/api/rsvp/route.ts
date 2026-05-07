import { NextResponse } from "next/server";
import { z } from "zod";

const RsvpSchema = z.object({
  name: z.string().min(1).max(40),
  side: z.enum(["groom", "bride"]),
  attending: z.boolean(),
  guestCount: z.number().int().min(0).max(10),
  mealCount: z.number().int().min(0).max(10),
  phone: z.string().min(8).max(20).optional(),
  note: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = RsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  // TODO: persist via Prisma once DB is connected.
  return NextResponse.json({ ok: true });
}
