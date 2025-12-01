"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Platform = "instagram" | "youtube" | "tiktok" | "spotify" | "facebook" | "pinterest" | null;

function detectPlatform(url: string | null): Platform {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const h = parsed.hostname.toLowerCase();
    const IG = ["instagram.com", "www.instagram.com", "instagr.am", "www.instagr.am"];
    const YT = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"];
    const TT = ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "m.tiktok.com"];
    const SP = ["spotify.com", "open.spotify.com", "www.spotify.com"];
    const FB = ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.watch", "fb.com", "www.fb.com"];
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

export default function Home() {
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState<Platform>(null);
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [quality, setQuality] = useState("720p");
  const [type, setType] = useState<"video" | "audio" | "image">("video");

  useEffect(() => {
    setPlatform(detectPlatform(input));
  }, [input]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error("clipboard error", err);
    }
  };

  const handleDownload = async () => {
    const trimmed = input.trim();
    if (!trimmed) return setStatus("Collez un lien valide.");
    const detected = detectPlatform(trimmed);
    if (!detected) return setStatus("Plateforme non supportée ou URL invalide.");
    setStatus(null);
    setDownloading(true);
    try {
      const payload: any = { url: trimmed };
      if (detected === "youtube") {
        payload.type = type;
        payload.quality = quality;
      }
      const resp = await fetch("/api/download", { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
      const json = await resp.json();
      if (!json || json.status !== "success") {
        setStatus(`Erreur: ${json?.reason || "backend error"}`);
        setDownloading(false);
        return;
      }
      const mediaUrl = json.url;
      const urlParts = mediaUrl.split("/");
      const rawName = urlParts[urlParts.length - 1].split("?")[0] || `${detected}.mp4`;
      let filename = rawName;
      // Try to fetch the binary and download
      let blob;
      try {
        const r2 = await fetch(mediaUrl);
        if (!r2.ok) throw new Error(`status:${r2.status}`);
        blob = await r2.blob();
      } catch (err) {
        // Try server-side streaming fallback to avoid CORS using our API
        setStatus("Téléchargement via proxy serveur (fallback) — ça peut prendre un peu plus de temps...");
        const fileResp = await fetch("/api/download/file", { method: "POST", body: JSON.stringify({ mediaUrl, filename: filename }), headers: { "Content-Type": "application/json" } });
        if (!fileResp.ok) {
          setStatus("Impossible de récupérer le fichier via le proxy.");
          setDownloading(false);
          return;
        }
        const arr = await fileResp.arrayBuffer();
        const ct = fileResp.headers.get("content-type") || "application/octet-stream";
        blob = new Blob([arr], { type: ct });
      }
      const ext = blob.type.split("/")[1] || (json.type === "audio" ? "mp3" : "mp4");
      // Ensure filename has the correct extension
      if (!filename.includes(".")) {
        filename = `${filename.split("?")[0] || detected}.${ext}`;
      } else if (!filename.endsWith(ext) && filename.split(".").pop() !== ext) {
        // replace extension if it seems incorrect
        const base = filename.split(".").slice(0, -1).join(".");
        filename = `${base}.${ext}`;
      }
      const a = document.createElement("a");
      const urlBlob = URL.createObjectURL(blob);
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlBlob);
      setStatus("Téléchargement terminé !");
    } catch (err: any) {
      console.error(err);
      setStatus(`Erreur: ${err?.message || "unknown"}`);
    } finally {
      setDownloading(false);
    }
  };

  const qualityOptions = ["1080p", "720p", "480p", "360p", "240p"];

  const placeholder = "Collez le lien d'Instagram, YouTube, TikTok, Spotify, Facebook, Pinterest";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-[#07071b] to-black p-8">
      <div className="w-full max-w-4xl rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-8 shadow-xl">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white">SD</div>
            <div>
              <h1 className="text-2xl font-semibold text-white">SocialDL — Téléchargeur rapide</h1>
              <p className="text-sm text-zinc-300">Collez un lien, choisissez la qualité, cliquez sur Télécharger</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-full bg-white/6 text-white hover:bg-white/12">Réinitialiser</button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex gap-3 items-center">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} className="flex-1 py-4 px-4 rounded-lg bg-white/6 text-white outline-none placeholder:text-white/40 backdrop-blur-sm border border-white/10" />
              <button onClick={handlePaste} className="px-4 py-3 rounded-lg bg-white/6 text-white hover:bg-white/10">Coller</button>
              <button onClick={() => setInput("")} className="px-4 py-3 rounded-lg bg-white/6 text-white hover:bg-white/10">Effacer</button>
            </div>

            <div className="flex gap-3 items-center mt-3">
              <div className="px-3 py-2 rounded-lg bg-white/3 text-white">Plateforme: <span className="font-semibold ml-2">{platform ?? "—"}</span></div>
              {platform === "youtube" && (
                <>
                  <select className="px-3 py-2 rounded-lg bg-white/3 text-white" value={type} onChange={(e) => setType(e.target.value as any)}>
                    <option value="video">Vidéo</option>
                    <option value="audio">Audio</option>
                  </select>
                  {type === "video" && (
                    <select className="px-3 py-2 rounded-lg bg-white/3 text-white" value={quality} onChange={(e) => setQuality(e.target.value)}>
                      {qualityOptions.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button onClick={handleDownload} disabled={downloading || !input} className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold disabled:opacity-50">{downloading ? "Téléchargement..." : "Télécharger"}</button>
              <div className="text-sm text-zinc-300">{status}</div>
            </div>
          </div>
          <aside className="md:col-span-1 bg-white/2 rounded-lg p-4 text-white/80">
            <h4 className="font-semibold mb-2">Aperçu / Infos</h4>
            <div className="text-sm text-zinc-300">
              <p>Plateforme: <b className="text-white">{platform ?? "—"}</b></p>
              <p>Format: <b className="text-white">{type}</b></p>
              {platform === "youtube" && <p>Quality: <b className="text-white">{quality}</b></p>}
              <p className="mt-3 text-xs text-zinc-400">Si le téléchargement échoue (CORS), le lien s'ouvrira dans un nouvel onglet.</p>
            </div>
          </aside>
        </section>

        <footer className="mt-8 text-sm text-zinc-400 text-center">Simple, rapide, et futuriste — SocialDL</footer>
      </div>
    </div>
  );
}
