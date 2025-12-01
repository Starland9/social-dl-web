import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://api.socialdl.starland9.dev";

function detectPlatform(url: string | null) {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    const instaHosts = ["instagram.com", "www.instagram.com", "instagr.am", "www.instagr.am"];
    if (instaHosts.includes(hostname)) return "instagram";
    const ytHosts = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"];
    if (ytHosts.includes(hostname)) return "youtube";
    const ttHosts = ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "m.tiktok.com"];
    if (ttHosts.includes(hostname)) return "tiktok";
    const spotifyHosts = ["spotify.com", "open.spotify.com", "www.spotify.com"];
    if (spotifyHosts.includes(hostname)) return "spotify";
    const fbHosts = ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.watch", "fb.com", "www.fb.com"];
    if (fbHosts.includes(hostname)) return "facebook";
    const pinHosts = ["pinterest.com", "www.pinterest.com", "pin.it"];
    if (pinHosts.includes(hostname)) return "pinterest";
    return null;
  } catch (err) {
    return null;
  }
}

async function postToBackend(path: string, body: any) {
  const url = `${BACKEND_URL}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const json = await resp.json();
    return json;
  } catch (err: any) {
    clearTimeout(timeout);
    return { status: "failed", reason: err.message || "backend error" };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, type = "video", quality = "720p" } = body || {};
    if (!url) return NextResponse.json({ status: "failed", reason: "Missing url" }, { status: 400 });
    const platform = detectPlatform(url);
    if (!platform) return NextResponse.json({ status: "failed", reason: "Unsupported platform" }, { status: 400 });

    let resp: any = { status: "failed", reason: "No response" };
    switch (platform) {
      case "instagram":
        resp = await postToBackend("/insta", { url });
        break;
      case "youtube":
        resp = await postToBackend("/yt", { url, type, quality });
        break;
      case "tiktok":
        resp = await postToBackend("/tiktok", { url });
        break;
      case "spotify":
        resp = await postToBackend("/spotify", { url });
        break;
      case "facebook":
        resp = await postToBackend("/facebook", { url });
        break;
      case "pinterest":
        resp = await postToBackend("/pinterest", { url });
        break;
    }

    if (!resp || resp.status !== "success") {
      return NextResponse.json({ status: "failed", reason: resp?.reason || "Download failed" }, { status: 500 });
    }

    // Normalize response - look for common keys
    const direct = resp?.ViDeO_LiNk_DeReCT || resp?.Video_Url || resp?.Audio_Url || resp?.AuDiO_LiNk_DeReCT || resp?.video || resp?.audio;
    const finalType = type || (resp?.type ? resp.type : "video");

    if (!direct) {
      return NextResponse.json({ status: "failed", reason: "No direct link returned." }, { status: 500 });
    }

    return NextResponse.json({ status: "success", url: direct, type: finalType, quality: resp?.Quality || quality });
  } catch (err: any) {
    return NextResponse.json({ status: "failed", reason: err.message }, { status: 500 });
  }
}
