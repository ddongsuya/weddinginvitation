import { NextResponse } from "next/server";
import { z } from "zod";

const PostSchema = z.object({
  name: z.string().min(1).max(20),
  message: z.string().min(1).max(500),
  password: z.string().min(4).max(20),
});

export async function GET() {
  // TODO: read from Prisma once DB is connected.
  return NextResponse.json({ ok: true, items: [] });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  // TODO: persist via Prisma once DB is connected.
  return NextResponse.json({ ok: true });
}
