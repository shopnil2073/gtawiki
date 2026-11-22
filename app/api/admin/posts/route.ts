import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { listSummaries } from "@/lib/admin-posts";
import { StoreError, storeMode } from "@/lib/content-store";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ mode: storeMode(), posts: await listSummaries() });
  } catch (e) {
    const status = e instanceof StoreError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status });
  }
}
