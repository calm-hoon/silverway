import { NextResponse } from "next/server";
import { buildHealthCheckData } from "@/lib/api/healthCheck";

export function GET() {
  const data = buildHealthCheckData();
  return NextResponse.json(data, { status: 200 });
}
