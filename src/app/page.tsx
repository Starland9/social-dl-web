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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    setPlatform(detectPlatform(input));
  }, [input]);

  useEffect(() => {
    const stored = localStorage.getItem("sd_history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  function platformIcon(p: Platform | string | null) {
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

  // Helper: convert Response to Blob with progress callback
  async function streamResponseToBlob(resp: Response, onProgress: (p: number) => void) {
    const contentLength = resp.headers.get("content-length");
    if (!resp.body) {
      // Not a stream-able body; fallback to arrayBuffer
      const arr = await resp.arrayBuffer();
      onProgress(100);
      return new Blob([arr], { type: resp.headers.get("content-type") || "application/octet-stream" });
    }
    const reader = resp.body.getReader();
    const total = contentLength ? parseInt(contentLength, 10) : NaN;
    let loaded = 0;
    const chunks: Uint8Array[] = [];
    let estimatedProgress = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.length;
        if (!isNaN(total)) {
          onProgress(Math.round((loaded / total) * 100));
        } else {
          // If total unknown, estimate progress incrementally
          estimatedProgress = Math.min(99, estimatedProgress + 5);
          onProgress(estimatedProgress);
        }
      }
    }
    onProgress(100);
    const blob = new Blob(chunks as any, { type: resp.headers.get("content-type") || "application/octet-stream" });
    return blob;
  }

  const handleDownloadFromHistory = async (entry: any) => {
    // Re-download a history entry's URL directly
    setInput(entry.url);
    setType(entry.type || "video");
    setPreviewUrl(entry.url);
    setPreviewType(entry.type || "video");
    setStatus(null);
    setDownloading(true);
    setProgress(0);
    try {
      const r = await fetch(entry.url);
      if (!r.ok) throw new Error(`status: ${r.status}`);
      const blob = await streamResponseToBlob(r, (p) => setProgress(p));
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = entry.filename || `download.${blob.type.split("/")[1] || "mp4"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlBlob);
      setStatus("Téléchargement terminé !");
      // Ensure history exists: add re-download event
      try {
        const existing = JSON.parse(localStorage.getItem("sd_history") || "[]");
        // Update `entry` time/size if blob available
        const entryUpdated = { ...entry, time: new Date().toISOString(), size: blob?.size || entry.size || 0 };
        existing.unshift(entryUpdated);
        const top = existing.slice(0, 20);
        localStorage.setItem("sd_history", JSON.stringify(top));
        setHistory(top);
      } catch (err) {
        console.warn("history save failed", err);
      }
    } catch (err: any) {
      console.error(err);
      setStatus(`Erreur: ${err?.message || "unknown"}`);
    } finally {
      setDownloading(false);
    }
  };

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
      const mediaType = json.type || "video";
      setPreviewUrl(mediaUrl);
      setPreviewType(mediaType);
      const urlParts = mediaUrl.split("/");
      const rawName = urlParts[urlParts.length - 1].split("?")[0] || `${detected}.mp4`;
      let filename = rawName;
      // Try to fetch the binary and download with streaming progress
      setProgress(0);
      let blob;
      try {
        // Attempt streaming download to monitor progress
        const r2 = await fetch(mediaUrl);
        if (!r2.ok) throw new Error(`status:${r2.status}`);
        blob = await streamResponseToBlob(r2, (p) => setProgress(p));
      } catch (err) {
        // Try server-side streaming fallback to avoid CORS using our API
        setStatus("Téléchargement via proxy serveur (fallback) — ça peut prendre un peu plus de temps...");
        const fileResp = await fetch("/api/download/file", { method: "POST", body: JSON.stringify({ mediaUrl, filename: filename }), headers: { "Content-Type": "application/json" } });
        if (!fileResp.ok) {
          setStatus("Impossible de récupérer le fichier via le proxy.");
          setDownloading(false);
          return;
        }
        // Attempt streaming from server proxy
        blob = await streamResponseToBlob(fileResp, (p) => setProgress(p));
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
      // Replace preview with actual blob URL so it can be played locally
      if (previewUrl && previewUrl !== urlBlob && previewUrl.startsWith?.("blob:")) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch (e) {}
      }
      setPreviewUrl(urlBlob);
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlBlob);
      setStatus("Téléchargement terminé !");
      setProgress(100);
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-900 via-[#07071b] to-black p-4 sm:p-8 overflow-x-hidden">
      <div className="w-full max-w-4xl rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-8 shadow-xl">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-linear-to-br from-pink-500 to-violet-500 flex items-center justify-center text-xl sm:text-2xl font-bold text-white hover:scale-105 hover:rotate-6 transition-transform duration-200">SD</div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-semibold text-white truncate">SocialDL</h1>
              <p className="text-xs sm:text-sm text-zinc-300 truncate">Téléchargeur rapide multi-plateformes</p>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="self-end sm:self-auto px-3 py-1.5 sm:py-2 text-sm rounded-md bg-white/6 text-white hover:bg-white/12">Réinitialiser</button>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="space-y-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} className="w-full py-3 px-3 text-sm sm:text-base rounded-lg bg-white/6 text-white outline-none placeholder:text-white/40 backdrop-blur-sm border border-white/10" />
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                <button onClick={handlePaste} className="px-3 py-2 text-sm rounded-lg bg-white/6 text-white hover:bg-white/10 active:scale-95 transition-transform">Coller</button>
                <button onClick={() => setInput("")} className="px-3 py-2 text-sm rounded-lg bg-white/6 text-white hover:bg-white/10 active:scale-95 transition-transform">Effacer</button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <div className="px-3 py-2 text-sm rounded-lg bg-white/3 text-white">{platformIcon(platform)} {platform ?? "—"}</div>
              {platform === "youtube" && (
                <>
                  <select className="px-3 py-2 text-sm rounded-lg bg-white/3 text-white" value={type} onChange={(e) => setType(e.target.value as any)}>
                    <option value="video">Vidéo</option>
                    <option value="audio">Audio</option>
                  </select>
                  {type === "video" && (
                    <select className="px-3 py-2 text-sm rounded-lg bg-white/3 text-white" value={quality} onChange={(e) => setQuality(e.target.value)}>
                      {qualityOptions.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  )}
                </>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <button onClick={handleDownload} disabled={downloading || !input} className="w-full px-6 py-3 rounded-full bg-linear-to-r from-pink-500 to-violet-500 text-white font-semibold disabled:opacity-50 active:scale-95 transition-transform">{downloading ? "Téléchargement..." : "Télécharger"}</button>
              {status && <div className="text-sm text-zinc-300 text-center">{status}</div>}
            </div>
            <div className="mt-3">
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div style={{ width: `${progress}%` }} className="h-2 bg-linear-to-r from-pink-500 to-violet-500 transition-all duration-300"></div>
              </div>
              <div className="text-xs text-zinc-400 mt-1">Progress: {progress}%</div>
            </div>
          </div>
          <aside className="md:col-span-1 bg-white/2 rounded-lg p-4 text-white/80">
            <h4 className="font-semibold mb-2">Aperçu / Infos</h4>
            <div className="mb-3">
              {previewUrl ? (
                previewType?.startsWith("image") || previewType === "image" ? (
                  // Image preview
                  <img src={previewUrl as string} alt="preview" onError={() => { setPreviewUrl(null); setStatus("Aperçu non disponible"); }} className="object-contain w-full rounded-md max-h-48" />
                ) : previewType === "audio" ? (
                  <audio src={previewUrl as string} controls onError={() => { setPreviewUrl(null); setStatus("Aperçu non disponible"); }} className="w-full max-h-20" />
                ) : (
                  <video src={previewUrl as string} controls onError={() => { setPreviewUrl(null); setStatus("Aperçu non disponible"); }} className="w-full rounded-md max-h-48" />
                )
              ) : (
                <div className="h-40 rounded-md bg-white/6 flex items-center justify-center text-sm text-zinc-400">Aucun aperçu</div>
              )}
            </div>
            <div className="text-sm text-zinc-300">
              <p>Plateforme: <b className="text-white">{platform ?? "—"}</b></p>
              <p>Format: <b className="text-white">{type}</b></p>
              {platform === "youtube" && <p>Quality: <b className="text-white">{quality}</b></p>}
              <p className="mt-3 text-xs text-zinc-400">Si le téléchargement échoue (CORS), le lien s'ouvrira dans un nouvel onglet.</p>
            </div>
            <div className="mt-4 border-t border-white/8 pt-3">
              <h5 className="text-sm font-semibold mb-2">Historique (local)</h5>
              <div className="mb-2 text-xs text-zinc-400">Utilisé pour relancer des téléchargements locaux sans ré-appeler le backend.</div>
              <div className="flex justify-end mb-2"><button onClick={() => { localStorage.removeItem('sd_history'); setHistory([]); }} className="py-1 px-2 rounded bg-red-500 text-white text-xs hover:opacity-80 transition-opacity">Effacer</button></div>
              <div className="max-h-48 overflow-auto">
                {history.length === 0 ? (
                  <div className="text-xs text-zinc-400">Aucun téléchargement enregistré</div>
                ) : (
                  history.map((h, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <div className="text-xs">
                        <div className="font-medium">{(h.platform ? platformIcon(h.platform) + " " : "")}{h.filename || h.url.split('/').pop()}</div>
                        <div className="text-zinc-400">{h.platform} • {h.type} • {(h.size / 1024).toFixed(0)} KB</div>
                        <div className="text-zinc-500 text-[10px]">{new Date(h.time).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setPreviewUrl(h.url); setPreviewType(h.type); }} className="px-2 py-1 rounded bg-white/6 text-white text-xs hover:scale-105 transition-transform duration-150">Aperçu</button>
                        <button onClick={() => handleDownloadFromHistory(h)} className="px-2 py-1 rounded bg-white/6 text-white text-xs hover:scale-105 transition-transform duration-150">Télécharger</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </section>

        <footer className="mt-8 text-sm text-zinc-400 text-center">
          <div>Simple, rapide, et futuriste — SocialDL</div>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs">
            <a href="https://github.com/Starland9" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">🐙 GitHub <span className="sr-only">(opens in a new tab)</span></a>
            <a href="https://www.linkedin.com/in/landry-simo-7b326122b" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">🔗 LinkedIn <span className="sr-only">(opens in a new tab)</span></a>
            <a href="https://portfolio.starland9.dev" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">🌐 Portfolio <span className="sr-only">(opens in a new tab)</span></a>
          </div>
        </footer>
      </div>
    </div>
  );
}
