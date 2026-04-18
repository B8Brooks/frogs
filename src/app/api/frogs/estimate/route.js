import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateFrogSize } from "@/lib/ai";

const DEFAULT_COLORS = [
  "#4a7c59", "#6b9080", "#cc6b49", "#d4a017", "#5b8cba", "#8e6a99",
];

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const existingBuckets = await prisma.bucket.findMany({
    orderBy: { createdAt: "asc" },
  });
  const bucketNames = existingBuckets.map((b) => b.name);

  const result = await estimateFrogSize({
    title: title.trim(),
    description: description?.trim() || null,
    existingBuckets: bucketNames,
  });

  let matchedBucket = null;

  if (result.bucket) {
    const lower = result.bucket.toLowerCase();
    const existing = existingBuckets.find(
      (b) => b.name.toLowerCase() === lower,
    );

    if (existing) {
      matchedBucket = existing;
    } else {
      try {
        const count = existingBuckets.length;
        matchedBucket = await prisma.bucket.create({
          data: {
            name: result.bucket,
            color: DEFAULT_COLORS[count % DEFAULT_COLORS.length],
          },
        });
      } catch (err) {
        if (err.code === "P2002") {
          matchedBucket = await prisma.bucket.findFirst({
            where: { name: result.bucket },
          });
        }
      }
    }
  }

  return NextResponse.json({
    size: result.size,
    reason: result.reason,
    bucket: matchedBucket,
    cleanedTitle: result.cleanedTitle,
  });
}
