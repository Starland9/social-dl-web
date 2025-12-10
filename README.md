This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## SocialDL Frontend

This repository contains a minimal Next.js app and a server-side proxy around a backend that can download social media media (YouTube, Instagram, TikTok, Facebook, Pinterest, Spotify).

Environment variables:

- `BACKEND_URL` (optional) - The backend proxy URL to use for retrieving direct media links. Defaults to `https://api.socialdl.starland9.dev`.

API:

- POST `/api/download` - Body: `{ url, type?, quality? }` - Detects platform and returns `{ status: 'success', url, type }` if available.
- POST `/api/download/file` - Body: `{ mediaUrl, filename? }` - Proxies and streams a remote media file through the server to avoid CORS.

Features added in UI:

- Preview media (video/audio/image) before/after download
- Local download history stored in `localStorage` (up to 20 items), with quick preview and re-download buttons
- Download progress bar with streaming progress (estimation when Content-Length not provided)
- Improved UI with micro-interactions and platform icons

## Deployment (PM2)

This project provides a `deploy/deploy.sh` helper script that:

- Installs dependencies (requires pnpm)
- Builds the Next.js static assets
- Starts the process using PM2 via `deploy/ecosystem.config.js`

Important notes for production deploys:

- Ensure `pnpm` and `pm2` are present on the machine (script uses `npx --yes pm2` when `pm2` is not installed globally).
- Export a `BACKEND_URL` environment variable if you want to use a custom upstream proxy instead of the default (`https://api.socialdl.starland9.dev`). Example:

```bash
BACKEND_URL=https://api.your-backend.example ./deploy/deploy.sh
```

- PM2 app name is `social-dl-web` and listens on port 3002 (configured in `deploy/ecosystem.config.js`).
- The script saves the PM2 process list (via `pm2 save`) so the process is persisted across reboots.

To run the deploy script locally:

```bash
./deploy/deploy.sh
```

If you prefer to manage deploy manually, you can start PM2 with the ecosystem file directly:

```bash
npx pm2 start deploy/ecosystem.config.js --env production
```

## PWA (Progressive Web App)

This project includes full PWA support with Web Share Target API integration:

- `public/manifest.json` — PWA manifest with icons (192/256/384/512) and **share_target** configuration
- `public/sw.js` — Service worker that caches basic assets and serves an `offline.html` fallback
- `public/offline.html` — A minimal offline page shown when the network is unavailable
- `src/app/share/route.ts` — API endpoint that handles shared URLs from the Web Share Target API
- `src/components/SwRegister.tsx` — Client component that registers the service worker

### Web Share Target API (Sharing Links from Other Apps)

When SocialDL is installed as a PWA, it automatically registers as a share target. This means:

1. Open any social media link (YouTube, Instagram, TikTok, etc.) in your browser
2. Click the "Share" button in the browser's address bar
3. Select "SocialDL" from the list of available share targets
4. The app opens and automatically pastes the link into the input field

How it works:

- The `share_target` in `manifest.json` tells the system to handle incoming shares via POST to `/share`
- The `/share` API endpoint extracts the URL from the form data and redirects to the home page with the URL in query params
- The page component detects the URL in query params and auto-fills the input field
- The URL is then automatically detected for platform-specific options

How to test locally:

1. Run the production build:

```bash
pnpm build
pnpm start
```

2. Open the site in Chrome and install it as a PWA (address bar menu > "Install SocialDL")
3. Open a YouTube/Instagram/TikTok link, click the browser's Share button, and select "SocialDL"
4. The app should open with the link pre-filled

How to test in dev:

1. Run `pnpm dev`
2. Manually test by visiting `http://localhost:3000/?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. The input field should auto-fill with the YouTube URL

### Service Worker Caching

The service worker implements a **network-first** strategy:

- Try to fetch from the network first
- If successful, cache the response
- If offline, serve cached version or fallback to `offline.html`

How to test locally:

1. Run the dev server:

```bash
pnpm dev
```

2. Open the site in Chrome and go to DevTools > Application > Service Workers to inspect the registration
3. Simulate offline mode (DevTools > Network > Offline) and reload to see `offline.html` fallback

Note: For full PWA installation and share target functionality, test in a production build because service worker and PWA behavior varies between `next dev` and `next start`.

UI: Paste a social URL and use the interface to choose quality (for YouTube) and download the media.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contact / A propos de l'auteur

- GitHub: <https://github.com/Starland9>
- LinkedIn: <https://www.linkedin.com/in/landry-simo-7b326122b>
- Portfolio: <https://portfolio.starland9.dev>
