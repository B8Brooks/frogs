import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_COLORS = [
  "#4a7c59",
  "#6b9080",
  "#cc6b49",
  "#d4a017",
  "#5b8cba",
  "#8e6a99",
];

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  const buckets = await prisma.bucket.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ buckets });
}

export async function POST(request) {
  const { error } = await requireSession();
  if (error) return error;

  const body = await request.json();
  const { name, color } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const trimmedName = name.trim();
  const count = await prisma.bucket.count();
  const pickedColor = color || DEFAULT_COLORS[count % DEFAULT_COLORS.length];

  try {
    const bucket = await prisma.bucket.create({
      data: { name: trimmedName, color: pickedColor },
    });
    return NextResponse.json({ bucket }, { status: 201 });
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A bucket with that name already exists" },
        { status: 409 },
      );
    }
    throw err;
  }
}
