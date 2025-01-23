import { NextRequest, NextResponse } from "next/server";

export default async function handler() {
  console.log("hello world");
  return new NextResponse("Hello World");
}
