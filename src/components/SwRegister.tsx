"use client";
import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.info('SW registered:', registration);
      } catch (err) {
        console.error('Service worker registration failed:', err);
      }
    });
  }, []);

  return null;
}
