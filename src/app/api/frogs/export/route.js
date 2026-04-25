import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function escapeCsv(val) {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const frogs = await prisma.frog.findMany({
    include: { bucket: true },
    orderBy: [{ createdAt: "desc" }],
  });

  const headers = [
    "Title",
    "Description",
    "Size",
    "Bucket",
    "Status",
    "Recurring",
    "Today's Frog",
    "Created",
    "Completed",
  ];

  const rows = frogs.map((f) => {
    let status = "Active";
    if (f.completed) status = "Eaten";
    else if (f.postponed) status = "Postponed";

    return [
      escapeCsv(f.title),
      escapeCsv(f.description),
      f.size,
      escapeCsv(f.bucket?.name),
      status,
      escapeCsv(f.recurrence),
      f.isTodaysFrog ? "Yes" : "No",
      f.createdAt ? new Date(f.createdAt).toISOString() : "",
      f.completedAt ? new Date(f.completedAt).toISOString() : "",
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="frogs-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
