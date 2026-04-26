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

export async function GET(request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const bucketId = searchParams.get("bucket");

  const where = {};
  if (bucketId && bucketId !== "all") {
    where.bucketId = bucketId;
  }

  const frogs = await prisma.frog.findMany({
    where,
    include: { bucket: true },
    orderBy: [
      { isTodaysFrog: "desc" },
      { completed: "asc" },
      { postponed: "asc" },
      { bucket: { name: "asc" } },
      { position: { sort: "asc", nulls: "last" } },
      { size: "desc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json({ frogs });
}

const VALID_RECURRENCE = new Set(["daily", "weekly", "monthly"]);

export async function POST(request) {
  const { error } = await requireSession();
  if (error) return error;

  const body = await request.json();
  const { title, description, size, bucketId, recurrence } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const frog = await prisma.frog.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      size: clampSize(size),
      bucketId: bucketId || null,
      recurrence: VALID_RECURRENCE.has(recurrence) ? recurrence : null,
    },
    include: { bucket: true },
  });

  return NextResponse.json({ frog }, { status: 201 });
}

function clampSize(size) {
  const n = Number(size);
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, Math.round(n)));
}
