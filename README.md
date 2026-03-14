# Domain Bot — React + Vite

Rebuilt from the single-file vanilla version into a proper local-dev React project. Has UX and UI improvements.

## Stack

| Layer | Tech |
|---|---|
| UI | React 18 + Vite |
| Styling | Plain CSS (no Tailwind dependency) |
| Local API | Node.js mock server (port 3001) |
| Production API | Cloudflare Worker (`worker.js`) |

## Project Structure

```
domain-bot/
├── index.html              # Vite entry
├── vite.config.js          # Proxies /api/* → localhost:3001 in dev
├── mock-server/
│   └── index.js            # Local mock of the Cloudflare Worker
├── src/
│   ├── main.jsx            # React root
│   ├── App.jsx             # Top-level component
│   ├── App.css             # All styles
│   ├── lib/
│   │   └── api.js          # fetch wrappers + formatPrice util
│   ├── hooks/
│   │   └── useSearch.js    # Debounced search hook
│   └── components/
│       ├── SearchBar.jsx
│       ├── DomainCard.jsx
│       └── ResultsList.jsx
```

## Local Development

```bash
npm install
npm run dev
```

This starts two things concurrently:
- **Vite dev server** at http://localhost:5173 (hot reload)
- **Mock server** at http://localhost:3001

Vite proxies all `/api/*` requests to the mock server, so the app just works.
Mock data is seeded per domain name — same domain always returns the same result.

## Switching to Real GoDaddy Data Locally

1. Open `mock-server/index.js`
2. Set `USE_GODADDY = true` at the top
3. Add your keys to `.env.local`:
   ```
   GODADDY_KEY=your_key
   GODADDY_SECRET=your_secret
   ```
4. Restart with `npm run dev`

## Production Deployment

1. Deploy `worker.js` to Cloudflare Workers (see original README)
2. Set `VITE_WORKER_URL` in your hosting env:
   ```
   VITE_WORKER_URL=https://domain-bot-proxy.YOUR-SUBDOMAIN.workers.dev
   ```
3. `npm run build` → deploy `dist/` to Cloudflare Pages, Netlify, etc.

## Adding TLDs

Edit the `DEFAULT_TLDS` array in `src/hooks/useSearch.js`.

## GoDaddy API Keys

https://developer.godaddy.com/keys
