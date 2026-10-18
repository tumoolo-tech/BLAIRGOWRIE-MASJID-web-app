# Blairgowrie Masjid web app — status

Repo: https://github.com/tumoolo-tech/BLAIRGOWRIE-MASJID-web-app (moved from TUMO-MOGAME, 2026-10-17)
Live: https://blairgowrie-masjid-web-app.vercel.app (Vercel, deploys from `main`)
Stack: Next.js 16.3.8 (App Router, all pages static), Supabase (data + admin auth), FormSubmit (contact form).

## Commands
- `npm run build && npm start` — production build (measure only this, never `next dev`)
- `npm test` — Playwright: static guards + every route on Chrome, Firefox, WebKit, iPad, iPhone SE (375), Android 360, 320
- `npm run lighthouse` — median of 3, desktop gated at ≥ 90, mobile reported. `-- <url>` for live.
  In Git Bash use `MSYS_NO_PATHCONV=1 LH_ROUTES=/,/events ...` or `/` is rewritten to a Windows path.

## Launch-standard audit — 2026-10-17 (branch `audit/launch-standard`)

Lighthouse performance, median of 3 (before = live site, after = local production build):

| Route | Desktop before → after | Mobile before → after |
|---|---|---|
| / | 84 → 100 | 45 → 92 |
| /about | 93 → 100 | 78 → 93 |
| /salah-times | 91 → 100 | 50 → 96 |
| /events | 52 → 100 | 19 → 94 |
| /prospectus | 99 → 100 | 38 → 94 |
| /contact | 95 → 100 | 55 → 94 |
| /donate | 88 → 100 | 57 → 94 |
| /privacy-policy | 98 → 100 | 57 → 97 |

Done:
- Next 16.2.2 → 16.3.8 (smallest release clearing the critical advisories; no 16.2.x patch had the fixes). `npm audit --omit=dev`: 0.
- Security headers + CSP (no `upgrade-insecure-requests`), robots.txt, sitemap.xml, canonical + unique title/description per route, JSON-LD (Mosque), admin/thank-you noindex.
- Fonts self-hosted via next/font; Material Symbols cut to a 9 KB subset of the 47 icons used (was 1.1 MB from Google).
- Privacy policy rewritten as a POPIA template; consent box, time-trap and honeypot on the contact form; ECTA s43 footer; cookie-free Vercel Web Analytics (renders only on Vercel).
- Speed: WebGL background starts on first interaction; nav links don't prefetch (it downloaded every page's images); third-party iframes load only when on screen; images re-encoded + phone-sized hero variants; public pages read Supabase with plain fetch instead of supabase-js (−54 KB gz).
- Fixed: /salah-times hydration error (#418); closed mobile menu reachable by keyboard; footer text contrast; contact form showed "Message Sent!" before sending and redirected to the *donation* thank-you page.

## Owner actions (not fixable from code)
1. **Run `supabase/migrations/20261017_announcements_event_at.sql`** in the Supabase SQL editor. The live table lacks `announcements.event_at`: every home-page load returns HTTP 400 and admins cannot add announcements. The same file lists RLS policies — confirm anon can only SELECT.
2. **Vercel ↔ GitHub after the transfer**: in Vercel → Project → Settings → Git, reconnect to `tumoolo-tech/BLAIRGOWRIE-MASJID-web-app` and give the Vercel GitHub app access to the `tumoolo-tech` org, or pushes won't deploy.
3. **Enable Web Analytics** in Vercel → Project → Analytics (free, cookie-free).
4. **Confirm with the Association**: legal status, NPO/registration number, information officer name (all in `app/content/site.js`, marked CONFIRM); have their legal adviser review the privacy policy template.
5. **Contact form delivery**: submit the form on the live site after deploy and confirm the email reaches blairgowriemasjid@gmail.com. FormSubmit has no DKIM/domain to verify; it sends from its own domain. Long term: move to a server route + Resend (verified domain) + Turnstile for rate-limited spam protection.
6. **Prospectus "Download PDF" button does nothing** — supply the PDF or remove the button.
7. Third-party embeds (MasjidBoardLive, Google Maps) bring their own trackers/cookies and a11y issues inside their iframes; disclosed in the privacy policy, not fixable here.
8. No custom domain yet: the canonical host is `blairgowrie-masjid-web-app.vercel.app`. Set `NEXT_PUBLIC_SITE_URL` when a domain is added.
