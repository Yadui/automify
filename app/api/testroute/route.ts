import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("hello world");
  return new NextResponse("Hello World");
}
