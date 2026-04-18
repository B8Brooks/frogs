import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Weekly frogs reset every Friday morning (configurable via WEEKLY_RESET_DAY env var).
// Day numbers: 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday.
const WEEKLY_RESET_DAY = Number(process.env.WEEKLY_RESET_DAY ?? 5);

function startOfToday(now) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

function lastResetDayMidnight(now) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const diff = (d.getDay() - WEEKLY_RESET_DAY + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function firstOfThisMonth(now) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
}

function shouldReset(frog, now) {
  if (!frog.completedAt) return false;
  const completed = new Date(frog.completedAt);
  switch (frog.recurrence) {
    case "daily":
      return completed < startOfToday(now);
    case "weekly":
      return completed < lastResetDayMidnight(now);
    case "monthly":
      return completed < firstOfThisMonth(now);
    default:
      return false;
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const candidates = await prisma.frog.findMany({
    where: {
      recurrence: { not: null },
      completed: true,
    },
  });

  const toReset = candidates.filter((f) => shouldReset(f, now));

  if (toReset.length > 0) {
    await prisma.frog.updateMany({
      where: { id: { in: toReset.map((f) => f.id) } },
      data: { completed: false, completedAt: null },
    });
  }

  const frogs = await prisma.frog.findMany({
    include: { bucket: true },
    orderBy: [
      { isTodaysFrog: "desc" },
      { completed: "asc" },
      { size: "desc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json({ refreshedCount: toReset.length, frogs });
}
