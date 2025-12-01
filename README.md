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

UI: Paste a social URL and use the interface to choose quality (for YouTube) and download the media.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
