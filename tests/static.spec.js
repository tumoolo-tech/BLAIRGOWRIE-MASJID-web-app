// Source-level guards that need no browser.
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const APP = resolve('app');
const files = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : /\.(js|jsx|mjs)$/.test(f) ? [p] : [];
});
const ALL = files(APP);
const isClient = (src) => /^\s*['"]use client['"]/.test(src);
const localImports = (file, src) =>
  [...src.matchAll(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g)].map((m) => {
    const base = resolve(dirname(file), m[1]);
    return [base, `${base}.js`, join(base, 'index.js')].find((p) => ALL.includes(p)) || base;
  });

// Content modules a client component may ship (small, no copy blocks).
const CLIENT_SAFE_CONTENT = ['site.js', 'routes.js'];

test('client components never pull page copy into the browser bundle', () => {
  const offenders = [];
  for (const file of ALL.filter((f) => isClient(readFileSync(f, 'utf8')))) {
    // follow local imports transitively: a helper file can drag content in indirectly
    const seen = new Set();
    const stack = [file];
    while (stack.length) {
      const f = stack.pop();
      if (seen.has(f) || !ALL.includes(f)) continue;
      seen.add(f);
      const rel = relative(join(APP, 'content'), f);
      if (!rel.startsWith('..') && !CLIENT_SAFE_CONTENT.includes(rel)) offenders.push(`${relative(APP, file)} -> content/${rel}`);
      stack.push(...localImports(f, readFileSync(f, 'utf8')));
    }
  }
  expect(offenders).toEqual([]);
});

test('no font CDN or remote Google images in the source', () => {
  const hits = ALL.filter((f) => /fonts\.googleapis|fonts\.gstatic|googleusercontent\.com\/aida-public/.test(readFileSync(f, 'utf8')));
  expect(hits.map((f) => relative(APP, f))).toEqual([]);
});

test('every page is either in the sitemap or deliberately noindex', async () => {
  const { PUBLIC_ROUTES, NOINDEX_ROUTES } = await import('../app/content/routes.js');
  const known = new Set([...PUBLIC_ROUTES.map((r) => r.path), ...NOINDEX_ROUTES]);
  const pages = ALL.filter((f) => /[\\/]page\.js$/.test(f))
    .map((f) => '/' + relative(APP, dirname(f)).split(/[\\/]/).filter(Boolean).join('/'))
    .map((p) => (p === '/' ? '/' : p.replace(/\/$/, '')));
  expect(pages.filter((p) => !known.has(p))).toEqual([]);
});

test('only /admin ships the full Supabase client', () => {
  // Public pages read through lib/publicData.js (plain fetch); supabase-js adds ~54KB gzipped.
  const offenders = ALL.filter((f) => !relative(APP, f).startsWith('admin') && !relative(APP, f).startsWith('lib'))
    .filter((f) => /from\s+['"](@supabase\/supabase-js|[./]+lib\/supabase)['"]/.test(readFileSync(f, 'utf8')));
  expect(offenders.map((f) => relative(APP, f))).toEqual([]);
});
