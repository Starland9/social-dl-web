import { Platform } from "@/lib/types/Platform";

export function detectPlatform(url: string | null): Platform {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const h = parsed.hostname.toLowerCase();
    const IG = [
      "instagram.com",
      "www.instagram.com",
      "instagr.am",
      "www.instagr.am",
    ];
    const YT = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"];
    const TT = [
      "tiktok.com",
      "www.tiktok.com",
      "vm.tiktok.com",
      "m.tiktok.com",
    ];
    const SP = ["spotify.com", "open.spotify.com", "www.spotify.com"];
    const FB = [
      "facebook.com",
      "www.facebook.com",
      "m.facebook.com",
      "fb.watch",
      "fb.com",
      "www.fb.com",
    ];
    const PIN = ["pinterest.com", "www.pinterest.com", "pin.it"];
    if (IG.includes(h)) return "instagram";
    if (YT.includes(h)) return "youtube";
    if (TT.includes(h)) return "tiktok";
    if (SP.includes(h)) return "spotify";
    if (FB.includes(h)) return "facebook";
    if (PIN.includes(h)) return "pinterest";
    return null;
  } catch (err) {
    return null;
  }
}

export function platformIcon(p: Platform | string | null) {
  switch (p) {
    case "instagram":
      return "📸";
    case "youtube":
      return "▶️";
    case "tiktok":
      return "🎵";
    case "spotify":
      return "🎧";
    case "facebook":
      return "📘";
    case "pinterest":
      return "📌";
    default:
      return "🔗";
  }
}

export function getExtFromType(type: string) {
  if (!type) return "";
  if (type.includes("mp4")) return ".mp4";
  if (type.includes("webm")) return ".webm";
  if (type.includes("mpeg")) return ".mp3";
  if (type.includes("mp3")) return ".mp3";
  if (type.includes("ogg")) return ".ogg";
  if (type.includes("wav")) return ".wav";
  if (type.includes("m4a")) return ".m4a";
  if (type.includes("jpeg")) return ".jpg";
  if (type.includes("jpg")) return ".jpg";
  if (type.includes("png")) return ".png";
  if (type.includes("gif")) return ".gif";
  if (type.includes("webp")) return ".webp";
  if (type.includes("pdf")) return ".pdf";
  return "";
}
