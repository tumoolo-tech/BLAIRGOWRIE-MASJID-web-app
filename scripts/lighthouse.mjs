// Repeatable Lighthouse run against a production build (never `next dev`).
//   npm run build && npm start            (in another terminal)
//   npm run lighthouse                     (defaults to http://127.0.0.1:3000)
//   npm run lighthouse -- https://blairgowrie-masjid-web-app.vercel.app
//   LH_ROUTES=/,/events LH_RUNS=1 npm run lighthouse
// Desktop: median of 3 runs per route, fails (exit 1) below 90.
// Mobile: Lighthouse's default slow-4G + 4x CPU throttling, median of 3, reported (target 90).
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from '@playwright/test';

const BASE = (process.argv[2] || 'http://127.0.0.1:3000').replace(/\/$/, '');
const ALL_ROUTES = ['/', '/about', '/salah-times', '/events', '/prospectus', '/contact', '/donate', '/privacy-policy'];
// LH_ROUTES=/,/events and LH_RUNS=1 narrow a run while investigating one page.
const ROUTES = process.env.LH_ROUTES ? process.env.LH_ROUTES.split(',') : ALL_ROUTES;
const RUNS = Number(process.env.LH_RUNS || 3);
const DESKTOP_GATE = 90;

const desktop = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
    onlyCategories: ['performance'],
  },
};
const mobile = { extends: 'lighthouse:default', settings: { onlyCategories: ['performance'] } };

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH || chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox'],
});

const rows = [];
try {
  for (const route of ROUTES) {
    const url = BASE + route;
    await fetch(url); // warm-up so the first measured run isn't a cold cache/compile
    const row = { route };
    for (const [name, config] of [['desktop', desktop], ['mobile', mobile]]) {
      const runs = [];
      for (let i = 0; i < RUNS; i++) {
        const { lhr } = await lighthouse(url, { port: chrome.port, logLevel: 'error', output: 'json' }, config);
        runs.push({
          score: Math.round(lhr.categories.performance.score * 100),
          lcp: lhr.audits['largest-contentful-paint'].numericValue,
          tbt: lhr.audits['total-blocking-time'].numericValue,
          cls: lhr.audits['cumulative-layout-shift'].numericValue,
          bytes: lhr.audits['total-byte-weight'].numericValue,
        });
      }
      const m = runs.find((r) => r.score === median(runs.map((x) => x.score)));
      row[name] = m;
    }
    rows.push(row);
    const f = (r) => `${String(r.score).padStart(3)}  LCP ${(r.lcp / 1000).toFixed(2)}s  TBT ${Math.round(r.tbt)}ms  CLS ${r.cls.toFixed(3)}  ${Math.round(r.bytes / 1024)}KB`;
    console.log(`${route.padEnd(16)} desktop ${f(row.desktop)} | mobile ${f(row.mobile)}`);
  }
} finally {
  await chrome.kill();
}

const failing = rows.filter((r) => r.desktop.score < DESKTOP_GATE);
const lowMobile = rows.filter((r) => r.mobile.score < 90);
if (lowMobile.length) console.log(`\nMobile below 90 (target, not gated): ${lowMobile.map((r) => `${r.route} ${r.mobile.score}`).join(', ')}`);
if (failing.length) {
  console.error(`\nDesktop below ${DESKTOP_GATE}: ${failing.map((r) => `${r.route} ${r.desktop.score}`).join(', ')}`);
  process.exit(1);
}
console.log(`\nAll routes ≥ ${DESKTOP_GATE} on desktop.`);
