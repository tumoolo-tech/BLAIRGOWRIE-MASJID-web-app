import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PUBLIC_ROUTES, NOINDEX_ROUTES } from '../app/content/routes.js';

const ALL_ROUTES = [...PUBLIC_ROUTES.map((r) => r.path), ...NOINDEX_ROUTES];
// Third-party embeds we don't control (their own console noise and failed beacons).
const THIRD_PARTY = /masjidboardlive|livemasjid|fontawesome|google\.com\/maps|maps\.google|gstatic|googletagmanager|cloudflareinsights|unpkg|jsdelivr|jquery|cdnjs/;
// supabase-js auth-js in Firefox: its background token-refresh tick asks for the cross-tab lock
// with a zero timeout and the rejection escapes as an uncaught error on /admin. Present on the
// live site before this audit; harmless, and replacing the lock would risk multi-tab refresh.
const KNOWN_LIBRARY_NOISE = /Navigator LockManager lock "lock:sb-.*-auth-token" immediately failed/;

function watch(page) {
  const problems = [];
  page.on('pageerror', (e) => {
    // Firefox reports errors from inside third-party iframes as page errors; the stack names the source
    if (!THIRD_PARTY.test(`${e.message} ${e.stack}`) && !KNOWN_LIBRARY_NOISE.test(e.message)) problems.push(`pageerror: ${e.message}`);
  });
  page.on('console', (m) => {
    if (m.type() === 'error' && !THIRD_PARTY.test(m.location().url || '') && !THIRD_PARTY.test(m.text())) {
      problems.push(`console: ${m.text()}`);
    }
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && !THIRD_PARTY.test(r.url())) problems.push(`${r.status()} ${r.url()}`);
  });
  return problems;
}

async function settle(page) {
  // Let client data loads finish and CSS entrance animations reach their final frame.
  await page.waitForLoadState('load');
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
}

test.describe('every route', () => {
  for (const route of ALL_ROUTES) {
    test(`${route} loads cleanly`, async ({ page }) => {
      const problems = watch(page);
      await page.addInitScript(() => {
        window.__csp = [];
        document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
      });
      const res = await page.goto(route);
      expect(res.status()).toBe(200);
      await settle(page);
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => window.__csp), 'CSP violations').toEqual([]);
      expect(problems, 'console errors / failed requests').toEqual([]);
    });

    test(`${route} SEO basics`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1); // client pages (admin) render their h1 after hydrating
      const seo = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        h1: document.querySelectorAll('h1').length,
        jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent)),
        imgNoAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
      }));
      expect(seo.title).toBeTruthy();
      expect(seo.description.length).toBeGreaterThanOrEqual(50);
      expect(seo.description.length).toBeLessThanOrEqual(160);
      expect(new URL(seo.canonical).pathname.replace(/\/$/, '') || '/').toBe(route);
      expect(seo.h1).toBe(1);
      expect(seo.jsonLd[0]?.['@type']).toBe('Mosque');
      expect(seo.imgNoAlt).toBe(0);
    });

    test(`${route} has no accessibility violations`, async ({ page }) => {
      await page.goto(route);
      await settle(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('iframe') // third-party embeds (Google Maps, MasjidBoardLive)
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });

    test(`${route} fits the screen with a side margin`, async ({ page }) => {
      await page.goto(route);
      await settle(page);
      const layout = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const edge = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const t = walker.currentNode;
          if (!t.textContent.trim()) continue;
          const el = t.parentElement;
          if (el.closest('[aria-hidden="true"], script, style')) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
          const range = document.createRange();
          range.selectNodeContents(t);
          for (const rc of range.getClientRects()) {
            if (rc.width && (rc.left < 4 || rc.right > vw - 4)) {
              edge.push(`"${t.textContent.trim().slice(0, 30)}" left=${Math.round(rc.left)} right=${Math.round(vw - rc.right)}`);
              break;
            }
          }
        }
        return { overflow: document.documentElement.scrollWidth - vw, edge };
      });
      expect(layout.overflow, 'horizontal scroll').toBeLessThanOrEqual(0);
      expect(layout.edge, 'text touching the screen edge').toEqual([]);
    });
  }
});

test('security headers are set, CSP has no upgrade-insecure-requests', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  for (const k of ['content-security-policy', 'strict-transport-security', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy']) {
    expect(h[k], k).toBeTruthy();
  }
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  // WebKit applies it to http://127.0.0.1 and breaks local Safari testing; HSTS covers production.
  expect(h['content-security-policy']).not.toContain('upgrade-insecure-requests');
});

test('robots allows crawling and the sitemap lists every public route', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toMatch(/Allow: \//);
  expect(robots).toMatch(/Sitemap: https:\/\/.+\/sitemap\.xml/);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const { path } of PUBLIC_ROUTES) {
    expect(sitemap).toMatch(new RegExp(`<loc>https://[^<]+${path === '/' ? '' : path}</loc>`));
  }
});

test('a missing page returns a real 404', async ({ request }) => {
  const res = await request.get('/this-page-does-not-exist');
  expect(res.status()).toBe(404);
});

test('no cookies and no font CDN', async ({ page, context }) => {
  const fontCdn = [];
  page.on('request', (r) => { if (/fonts\.(googleapis|gstatic)\.com/.test(r.url()) && r.frame() === page.mainFrame()) fontCdn.push(r.url()); });
  for (const route of ['/', '/contact', '/privacy-policy']) {
    await page.goto(route);
    await settle(page);
  }
  expect(fontCdn).toEqual([]);
  const own = (await context.cookies()).filter((c) => /127\.0\.0\.1|localhost|vercel\.app/.test(c.domain));
  expect(own).toEqual([]);
});

test('footer shows the ECTA s43 details', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer).toContainText('Blairgowrie Muslim Association');
  await expect(footer).toContainText('Registration');
  await expect(footer).toContainText('70 Conrad Drive');
  await expect(footer).toContainText('072 441 1651');
  await expect(footer).toContainText('blairgowriemasjid@gmail.com');
  await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy-policy');
});

test('privacy policy names the POPIA essentials', async ({ page }) => {
  await page.goto('/privacy-policy');
  const main = page.locator('main');
  for (const text of ['template', 'Responsible party', 'Information officer', 'IP address', 'Vercel', 'FormSubmit', 'Supabase', 'outside South Africa', 'Information Regulator', 'inforegulator.org.za']) {
    await expect(main).toContainText(text);
  }
});

test.describe('contact form', () => {
  test('consent box is required, unticked and links to the policy', async ({ page }) => {
    await page.goto('/contact');
    const consent = page.locator('#contact-consent');
    await expect(consent).not.toBeChecked();
    await expect(consent).toHaveAttribute('required', '');
    await expect(page.locator('label[for="contact-consent"] a')).toHaveAttribute('href', '/privacy-policy');
    for (const id of ['contact-name', 'contact-email', 'contact-message']) {
      await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
    }
  });

  test('posts name, email, message and consent to FormSubmit (intercepted, no email sent)', async ({ page }) => {
    let posted = null;
    await page.route('https://formsubmit.co/**', async (route) => {
      posted = route.request().postData();
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>stub</h1>' });
    });
    const t0 = Date.now();
    await page.clock.setFixedTime(t0);
    await page.goto('/contact');
    await expect(page.locator('#contact-name')).toBeEditable();
    await page.waitForTimeout(300); // let the form's mount effect record when it opened
    await page.clock.setFixedTime(t0 + 4000); // the time-trap rejects forms sent faster than a person can type
    await page.locator('#contact-name').fill('Playwright Test');
    await page.locator('#contact-email').fill('test@example.com');
    await page.locator('#contact-message').fill('Automated test message.');
    await page.locator('#contact-submit').click();
    await expect(page.locator('#contact-consent:invalid')).toHaveCount(1);
    expect(posted).toBeNull();
    await page.locator('#contact-consent').check();
    await page.locator('#contact-submit').click();
    await expect.poll(() => posted).not.toBeNull();
    expect(posted).toContain('consent=');
    expect(posted).toContain('_honey=');
    expect(decodeURIComponent(posted)).toContain('/contact/sent'); // FormSubmit's _next redirect
  });

  test('time-trap blocks an instant submit', async ({ page }) => {
    let posted = false;
    await page.route('https://formsubmit.co/**', (route) => { posted = true; return route.abort(); });
    await page.clock.setFixedTime(Date.now()); // frozen clock: the submit is "instant" however slow the machine is
    await page.goto('/contact');
    await page.locator('#contact-name').fill('Bot');
    await page.locator('#contact-email').fill('bot@example.com');
    await page.locator('#contact-message').fill('spam');
    await page.locator('#contact-consent').check();
    await page.locator('#contact-submit').click();
    await expect(page.locator('form [role="alert"]')).toBeVisible();
    expect(posted).toBe(false);
  });
});

test.describe('navigation', () => {
  test('closed mobile menu is not reachable by keyboard; it opens, works and closes', async ({ page, isMobile }) => {
    await page.goto('/about');
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeHidden();
    await expect(menu.getByRole('link', { name: 'Events' })).toBeHidden();
    const toggle = page.locator('button[aria-controls="mobile-menu"]');
    if (!(await toggle.isVisible())) return; // desktop layout shows the inline links instead
    await expect(toggle).toHaveAccessibleName('Open menu');
    await (isMobile ? toggle.tap() : toggle.click());
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAccessibleName('Close menu');
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await (isMobile ? toggle.tap() : toggle.click());
    const link = menu.getByRole('link', { name: 'Events' });
    await (isMobile ? link.tap() : link.click());
    await page.waitForURL('**/events');
    await expect(menu).toBeHidden();
  });

  test('every internal link resolves', async ({ page, request }) => {
    await page.goto('/');
    const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')))]);
    for (const href of hrefs) {
      expect((await request.get(href)).status(), href).toBe(200);
    }
  });
});

test('salah times hydrates without a mismatch', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/salah-times');
  await expect(page.locator('h1')).toHaveText('Salah Times');
  await page.waitForTimeout(1000);
  expect(errors.filter((m) => /418|hydrat/i.test(m))).toEqual([]);
});

test('the WebGL background waits for the first interaction', async ({ page }) => {
  await page.goto('/about');
  await page.waitForTimeout(1500);
  // init() sizes the canvas (default 300px wide) or, without WebGL, paints a fallback colour
  const started = () => page.evaluate(() => {
    const c = document.getElementById('webgl_canvas');
    return c.width !== 300 || c.style.background !== '';
  });
  expect(await started(), 'started before any interaction').toBe(false);
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
  await expect.poll(started, { timeout: 5000 }).toBe(true);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('animations land on their final state and the background does not loop', async ({ page }) => {
    await page.goto('/events');
    const durations = await page.evaluate(() => document.getAnimations().map((a) => a.effect.getTiming().duration));
    for (const d of durations) expect(Number(d)).toBeLessThan(1);
    const frames = await page.evaluate(async () => {
      let n = 0;
      const orig = window.requestAnimationFrame;
      window.requestAnimationFrame = (cb) => { n++; return orig(cb); };
      window.dispatchEvent(new Event('scroll')); // the WebGL background starts on first interaction
      await new Promise((r) => setTimeout(r, 2500));
      window.requestAnimationFrame = orig;
      return n;
    });
    expect(frames).toBeLessThan(5);
  });
});

test('home prayer strip shows the board salah times (Maghrib = adhan)', async ({ page }) => {
  await page.route('**/api/prayer-times', (route) => route.fulfill({
    json: { times: { fajr: '04:45', sunrise: '05:30', dhuhr: '13:00', asr: '17:15', maghrib: '18:19', isha: '20:00' } },
  }));
  await page.goto('/');
  const strip = page.locator('[class*=prayerTimes]').first();
  for (const t of ['04:45 AM', '05:30 AM', '01:00 PM', '05:15 PM', '06:19 PM', '08:00 PM']) {
    await expect(strip).toContainText(t);
  }
});

test('prayer-times API returns the board times', async ({ request }) => {
  const res = await request.get('/api/prayer-times');
  expect(res.status()).toBe(200);
  const { times } = await res.json();
  for (const k of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']) expect(times[k], k).toMatch(/^\d{1,2}:\d{2}$/);
});

test('home prayer strip picks up a changed board time without a reload', async ({ page }) => {
  let asr = '17:15';
  await page.route('**/api/prayer-times', (route) => route.fulfill({
    json: { times: { fajr: '04:45', sunrise: '05:30', dhuhr: '13:00', asr, maghrib: '18:19', isha: '20:00' } },
  }));
  await page.clock.install();
  await page.goto('/');
  const strip = page.locator('[class*=prayerTimes]').first();
  await expect(strip).toContainText('05:15 PM');
  asr = '17:30'; // the board's Asr time changes
  await page.clock.runFor(5 * 60 * 1000);
  await expect(strip).toContainText('05:30 PM');
});
