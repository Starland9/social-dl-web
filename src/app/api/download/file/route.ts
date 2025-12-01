import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://api.socialdl.starland9.dev";

export async function POST(req: Request) {
  try {
    const { mediaUrl, filename } = await req.json();
    if (!mediaUrl) return NextResponse.json({ status: "failed", reason: "Missing mediaUrl" }, { status: 400 });
    // Proxy the file from server-side to avoid CORS and to enable direct download
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    try {
      const r = await fetch(mediaUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (!r.ok) return NextResponse.json({ status: "failed", reason: `Failed to fetch media (status ${r.status})` }, { status: 502 });
      const contentType = r.headers.get("content-type") || "application/octet-stream";
      // Convert the streamed response to an ArrayBuffer then return as response
      const arrayBuf = await r.arrayBuffer();
      return new Response(arrayBuf, { status: 200, headers: { "Content-Type": contentType, "Content-Disposition": `attachment; filename=${filename || "download"}` } });
    } catch (err: any) {
      clearTimeout(timeout);
      return NextResponse.json({ status: "failed", reason: err.message || "fetch error" }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ status: "failed", reason: "Bad request" }, { status: 400 });
  }
}
