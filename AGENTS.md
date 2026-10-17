<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project rules (learned the hard way)

- Measure speed only on a production build (`npm run build && npm start`, then `npm run lighthouse`). Keep desktop ≥ 90, mobile target ≥ 90.
- Public pages read Supabase through `app/lib/publicData.js` (plain fetch). Only `/admin` may import `lib/supabase` / `@supabase/supabase-js` (~54 KB gz). Guarded in `tests/static.spec.js`.
- Client components may import only `content/site.js` and `content/routes.js`; page copy stays in server components. Guarded.
- Nav/footer `<Link>`s use `prefetch={false}`: viewport prefetch of static routes downloaded every linked page's images on every view (~700 KB on phones).
- Third-party iframes use `components/LazyIframe.js`, not `loading="lazy"`: native lazy loads a screen early, and the MasjidBoardLive board alone cost ~20 mobile Lighthouse points.
- The WebGL background starts on first interaction. Any heavy effect must not run during page load.
- Never render time/date during prerender in a client component (hydration error #418): start state as null, set it in an effect.
- New pages: add to `content/routes.js` (sitemap or noindex), give them a `metadata` with description 50–160 chars and their own `alternates.canonical` (a child without one inherits `/`).
- CSP lives in `next.config.mjs`. Never add `upgrade-insecure-requests` (breaks WebKit on http://127.0.0.1). New third-party hosts must be added there and to the privacy policy.
- The DB schema is not in the repo: before using a new column, add a migration under `supabase/migrations/` and confirm it was run. `announcements.event_at` was missing in production, so every home-page load got HTTP 400.
