import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

export async function PATCH(request, { params }) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = params;
  const body = await request.json();

  const data = {};

  if (typeof body.title === "string") data.title = body.title.trim();
  if ("description" in body) data.description = body.description?.trim() || null;
  if ("bucketId" in body) data.bucketId = body.bucketId || null;

  if ("recurrence" in body) {
    const valid = new Set(["daily", "weekly", "monthly"]);
    data.recurrence = valid.has(body.recurrence) ? body.recurrence : null;
  }

  if (typeof body.size !== "undefined") {
    const n = Number(body.size);
    if (Number.isFinite(n)) data.size = Math.min(5, Math.max(1, Math.round(n)));
  }

  if (typeof body.postponed === "boolean") {
    data.postponed = body.postponed;
    if (body.postponed) data.isTodaysFrog = false;
  }

  if (typeof body.position === "number") {
    data.position = body.position;
  }

  if (typeof body.completed === "boolean") {
    data.completed = body.completed;
    data.completedAt = body.completed ? new Date() : null;
    if (body.completed) {
      data.isTodaysFrog = false;
      data.postponed = false;
    }
  }

  if (typeof body.isTodaysFrog === "boolean") {
    if (body.isTodaysFrog) {
      await prisma.frog.updateMany({
        where: { isTodaysFrog: true, NOT: { id } },
        data: { isTodaysFrog: false },
      });
    }
    data.isTodaysFrog = body.isTodaysFrog;
  }

  const frog = await prisma.frog.update({
    where: { id },
    data,
    include: { bucket: true },
  });

  return NextResponse.json({ frog });
}

export async function DELETE(_request, { params }) {
  const { error } = await requireSession();
  if (error) return error;

  await prisma.frog.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
