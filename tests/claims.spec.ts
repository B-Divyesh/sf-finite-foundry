import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

const origin = 'http://127.0.0.1:4174';
const solutions = [
  ['cutter', 'press'],
  ['cutter', 'kiln', 'cooler', 'press'],
  ['sorter', 'press', 'assembler'],
  ['sorter', 'press', 'buffer', 'kiln', 'assembler'],
  ['cutter', 'splitter', 'press', 'assembler', 'recycler'],
  ['cutter', 'sorter', 'press', 'kiln', 'assembler', 'recycler']
] as const;

async function clickNow(locator: ReturnType<Page['locator']>): Promise<void> {
  await locator.evaluate((element: HTMLElement) => element.click());
}

async function chooseLowestQuota(page: Page): Promise<void> {
  const tickets = page.locator('[data-contract]');
  await expect(tickets).toHaveCount(3);
  const texts = await tickets.allTextContents();
  const quotas = texts.map((text) => Number(text.match(/(\d+) units/)?.[1] ?? 999));
  await clickNow(tickets.nth(quotas.indexOf(Math.min(...quotas))));
}

async function placeRoute(page: Page, machines: readonly string[]): Promise<void> {
  for (let index = 0; index < machines.length; index += 1) {
    await clickNow(page.locator(`[data-machine="${machines[index]}"]`));
    await clickNow(page.locator(`[data-slot="${index}"]`));
  }
}

async function startFullDemo(page: Page, testClock = true): Promise<void> {
  await page.goto(testClock ? '/demo?test=1' : '/demo');
  await page.getByRole('button', { name: 'Play full demo' }).click();
  await expect(page.getByText('Chapter 1 of 6')).toBeVisible();
}

async function assertNoPaidOrManipulativeSurface(page: Page): Promise<void> {
  await expect(page.locator('a[href*="checkout"], [data-ad], [data-energy], [data-loot], [data-license], [data-paywall], form[action*="payment"]')).toHaveCount(0);
  const links = await page.locator('a').evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).href));
  expect(links.some((url) => /checkout|payment|license/i.test(url))).toBe(false);
}

test('@claim:campaign-ending @claim:finite-free-run completes all six chapters without paid mechanics and restarts', async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== origin) outsideRequests.push(request.url()); });
  await startFullDemo(page);
  for (let chapter = 0; chapter < 6; chapter += 1) {
    await assertNoPaidOrManipulativeSurface(page);
    await expect(page.getByText(`Chapter ${chapter + 1} of 6`)).toBeVisible();
    await chooseLowestQuota(page);
    await placeRoute(page, solutions[chapter]!);
    await clickNow(page.locator('[data-action="start-shift"]'));
    await expect(page.getByRole('heading', { name: 'Contract complete' })).toBeVisible();
    await assertNoPaidOrManipulativeSurface(page);
    await clickNow(page.locator('[data-action="next-chapter"]'));
  }
  while (await page.locator('[data-dismantle]').count()) await clickNow(page.locator('[data-dismantle]').first());
  await clickNow(page.locator('[data-action="finish-campaign"]'));
  await expect(page.getByRole('heading', { level: 1, name: 'You finished the foundry' })).toBeVisible();
  await assertNoPaidOrManipulativeSurface(page);
  expect(outsideRequests).toEqual([]);
  page.once('dialog', (dialog) => dialog.accept());
  await clickNow(page.locator('.ending [data-action="new-campaign"]'));
  await expect(page.getByText('Chapter 1 of 6')).toBeVisible();
  await expect(page.getByText('Campaign complete')).toHaveCount(0);
});

test('@claim:local-save-pause preserves the persisted clock while the page is closed', async ({ context, page }) => {
  await startFullDemo(page, false);
  await chooseLowestQuota(page);
  await placeRoute(page, solutions[0]);
  await clickNow(page.locator('[data-action="start-shift"]'));
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('demo:finite-foundry:save')!).remainingMs)).toBeLessThan(300_000);
  await page.close();
  const closedStorage = await context.storageState();
  const demoOrigin = closedStorage.origins.find(({ origin: savedOrigin }) => savedOrigin === origin)!;
  const before = JSON.parse(demoOrigin.localStorage.find(({ name }) => name === 'demo:finite-foundry:save')!.value).remainingMs as number;
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const reopened = await context.newPage();
  await reopened.goto('/demo');
  await expect(reopened.locator('[data-action="resume-shift"]')).toBeVisible();
  const after = await reopened.evaluate(() => JSON.parse(localStorage.getItem('demo:finite-foundry:save')!).remainingMs as number);
  expect(after).toBe(before);
  await reopened.waitForTimeout(800);
  expect(await reopened.evaluate(() => JSON.parse(localStorage.getItem('demo:finite-foundry:save')!).remainingMs as number)).toBe(after);
});

test('@claim:hidden-tab-pause pauses a shift when the game loses visibility', async ({ page }) => {
  await startFullDemo(page, false);
  await chooseLowestQuota(page);
  await placeRoute(page, solutions[0]);
  await clickNow(page.locator('[data-action="start-shift"]'));
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:finite-foundry:save')!).remainingMs as number);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await new Promise((resolve) => setTimeout(resolve, 800));
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('demo:finite-foundry:save')!).status)).toBe('paused');
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:finite-foundry:save')!).remainingMs as number);
  expect(before - after).toBeLessThanOrEqual(1_000);
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('demo:finite-foundry:save')!).remainingMs as number)).toBe(after);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('[data-action="resume-shift"]')).toBeVisible();
});

test('@claim:export-import-roundtrip exports, previews, confirms, and restores a campaign', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('[data-action="reset-demo"]').click();
  const initial = JSON.parse((await page.evaluate(() => localStorage.getItem('demo:finite-foundry:save')))!) as { seed: number; chapterIndex: number; route: string[] };
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-action="export-save"]').click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const stream = await download.createReadStream();
  let content = '';
  for await (const chunk of stream) content += chunk.toString();
  const record = JSON.parse(content) as { product: string; campaign: { seed: number; chapterIndex: number } };
  expect(record.product).toBe('finite-foundry');
  expect(record.campaign.seed).toBe(240319);
  await page.locator('[data-action="reset-demo"]').click();
  await page.getByRole('button', { name: 'Play full demo' }).click();
  await page.setInputFiles('[data-action="import-file"]', path!);
  await expect(page.getByRole('heading', { name: 'Replace this campaign?' })).toBeVisible();
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('demo:finite-foundry:save')))!).chapterIndex).not.toBe(initial.chapterIndex);
  await page.getByRole('button', { name: 'Replace with imported campaign' }).click();
  const restored = JSON.parse((await page.evaluate(() => localStorage.getItem('demo:finite-foundry:save')))!);
  expect({ seed: restored.seed, chapterIndex: restored.chapterIndex, route: restored.route }).toEqual({ seed: initial.seed, chapterIndex: initial.chapterIndex, route: initial.route });
  await expect(page.getByText('Chapter 2 of 6')).toBeVisible();
});

test('campaign import rejects damaged files without changing the current save', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('[data-action="reset-demo"]').click();
  const before = await page.evaluate(() => localStorage.getItem('demo:finite-foundry:save'));
  await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>('[data-action="import-file"]')!;
    const transfer = new DataTransfer();
    transfer.items.add(new File(['{"product":"finite-foundry","campaign":{"version":99}}'], 'broken.json', { type: 'application/json' }));
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.getByRole('heading', { name: 'This file cannot be imported' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('damaged or uses an unsupported version');
  expect(await page.evaluate(() => localStorage.getItem('demo:finite-foundry:save'))).toBe(before);
  await page.getByRole('button', { name: 'Cancel import' }).click();
  await expect(page.getByRole('heading', { name: 'This file cannot be imported' })).toHaveCount(0);
});

test('@claim:demo-isolation preserves the real campaign through every demo exit path', async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== origin) outsideRequests.push(request.url()); });
  await page.goto('/play');
  await page.locator('[data-contract]').first().click();
  const realSave = await page.evaluate(() => localStorage.getItem('finite-foundry:save'));
  expect(realSave).toBeTruthy();
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Turn sound off' }).click();
  await page.locator('[data-action="reset-demo"]').click();
  await expect(page.getByText('Chapter 2 of 6')).toBeVisible();
  await expect(page.locator('[data-slot].filled')).toHaveCount(4);
  await page.getByRole('button', { name: 'Play full demo' }).click();
  expect(await page.evaluate(() => localStorage.getItem('finite-foundry:save'))).toBe(realSave);
  await page.locator('[data-action="reset-demo"]').click();
  expect(await page.evaluate(() => localStorage.getItem('finite-foundry:save'))).toBe(realSave);
  await page.locator('[data-action="start-real"]').click();
  expect(await page.evaluate(() => localStorage.getItem('finite-foundry:save'))).toBe(realSave);
  expect(await page.evaluate(() => localStorage.getItem('demo:finite-foundry:save'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('demo:finite-foundry:mute'))).toBeNull();
  expect(outsideRequests).toEqual([]);
});

test('@claim:offline-reload reloads the demo without a network', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(`${origin}/demo`);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Make room for heat' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await context.close();
});

test('@claim:sound-setting keeps the sound choice after reload and separates demo from real play', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Turn sound off' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Turn sound on' })).toBeVisible();
  await page.goto('/play');
  await expect(page.getByRole('button', { name: 'Turn sound off' })).toBeVisible();
});

test('@claim:purchase-availability keeps bonus contracts unavailable on every route', async ({ page }) => {
  for (const path of ['/', '/play', '/demo', '/privacy', '/terms']) {
    await page.goto(path);
    await assertNoPaidOrManipulativeSurface(page);
  }
  await page.goto('/terms');
  await expect(page.getByText('Bonus contracts are unavailable while operator registration is pending.')).toBeVisible();
  expect(await page.locator('meta[name="description"]').getAttribute('content')).toBe('Terms for playing Finite Foundry while optional bonus contracts are unavailable.');
});

test('@claim:shift-duration exposes a five-minute simulated shift', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Clock', { exact: true })).toBeVisible();
  await expect(page.getByText('5:00 simulated')).toBeVisible();
  await expect(page.locator('[data-timer]')).toHaveText('5:00');
});

test('@claim:seeded-contracts gives the full demo three distinct named choices', async ({ page }) => {
  await startFullDemo(page);
  const tickets = page.locator('[data-contract]');
  await expect(tickets).toHaveCount(3);
  const clients = await tickets.locator('strong').allTextContents();
  const products = await tickets.locator('span:nth-of-type(2)').allTextContents();
  const quotas = (await tickets.locator('b').allTextContents()).map((text) => Number(text.match(/\d+/)?.[0]));
  expect(clients).toEqual(['North Quay Repairs', 'Canal Lock Works', 'Civic Sign Shop']);
  expect(new Set(clients).size).toBe(3);
  expect(products).toEqual(['Flat brackets', 'Flat brackets', 'Flat brackets']);
  expect(quotas.sort((a, b) => a! - b!)).toEqual([20, 23, 27]);
});

test('@claim:demo-setup opens chapter two with a complete route and a 10x clock', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Chapter 2 of 6')).toBeVisible();
  for (const [index, machine] of ['Cutter', 'Kiln', 'Cooling rack', 'Press'].entries()) {
    await expect(page.locator(`[data-slot="${index}"]`)).toHaveAttribute('aria-label', new RegExp(machine));
  }
  await page.getByRole('button', { name: 'Run five-minute shift' }).click();
  const seconds = (value: string | null) => {
    const [minutes = 0, remainder = 0] = (value ?? '0:0').split(':').map(Number);
    return minutes * 60 + remainder;
  };
  const before = seconds(await page.locator('[data-timer]').textContent());
  await page.waitForTimeout(1500);
  const after = seconds(await page.locator('[data-timer]').textContent());
  expect(before - after).toBeGreaterThanOrEqual(10);
  expect(before - after).toBeLessThanOrEqual(20);
});

test('@claim:input-modes supports pointer, keyboard, and touch route placement', async ({ page, browser }) => {
  await page.goto('/demo');
  await page.locator('[data-action="clear-route"]').click();
  await page.locator('[data-machine="cutter"]').click();
  await page.locator('[data-slot="0"]').click();
  await expect(page.locator('[data-slot="0"]')).toHaveAttribute('aria-label', /Cutter/);
  await page.locator('[data-machine="kiln"]').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('2');
  await expect(page.locator('[data-slot="1"]')).toHaveAttribute('aria-label', /Kiln/);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const touchPage = await context.newPage();
  await touchPage.goto(`${origin}/demo`);
  await touchPage.locator('[data-action="clear-route"]').tap();
  await touchPage.locator('[data-machine="cutter"]').tap();
  await touchPage.locator('[data-slot="0"]').tap();
  await expect(touchPage.locator('[data-slot="0"]')).toHaveAttribute('aria-label', /Cutter/);
  await context.close();
});

test('@claim:privacy-surface crawls every route without accounts, analytics, payments, or cross-origin requests', async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== origin) outsideRequests.push(request.url()); });
  for (const path of ['/', '/play', '/demo', '/privacy', '/terms', '/missing-page']) {
    await page.goto(path);
    await expect(page.locator('form[action*="login"], [data-account], [data-analytics], [data-license], a[href*="checkout"], script[src*="analytics"]')).toHaveCount(0);
  }
  expect(outsideRequests).toEqual([]);
});

test('@claim:frame-rate keeps active demo animation at or below a 20ms p95 interval', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Run five-minute shift' }).click();
  const p95 = await page.evaluate(() => new Promise<number>((resolve) => {
    const frames: number[] = [];
    let previous = performance.now();
    const sample = (now: number) => {
      frames.push(now - previous);
      previous = now;
      if (frames.length === 120) {
        frames.sort((a, b) => a - b);
        resolve(frames[Math.floor(frames.length * 0.95)]!);
      } else requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
  expect(p95).toBeLessThanOrEqual(20);
});

test('@claim:demo-paths serves both demo URLs with the isolated sample banner', async ({ page }) => {
  for (const path of ['/demo', '/?demo=1']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  }
});

test('@claim:asset-provenance verifies local fonts and generated-art records', async ({ page }) => {
  await page.goto('/demo');
  const fontUrls = await page.evaluate(() => [...document.fonts].map((font) => font.family));
  expect(fontUrls).toContain('Atkinson Hyperlegible');
  const provenance = await (await page.request.get('/assets/finite-foundry-artwork.json')).json();
  expect(provenance.model).toBe('factory-image');
  expect(provenance.prompt).toContain('no text');
  expect((await page.request.get('/assets/FONT-LICENSES.md')).ok()).toBe(true);
  expect((await page.request.get('/assets/finite-foundry-social.webp')).ok()).toBe(true);
});

test('semantic, metadata, and accessibility checks pass on every app route', async ({ page }) => {
  for (const path of ['/', '/play', '/demo', '/privacy', '/terms']) {
    const errors: string[] = [];
    const listener = (message: { type(): string; text(): string }) => { if (message.type() === 'error') errors.push(message.text()); };
    page.on('console', listener);
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(path === '/' ? '/$' : `${path}$`));
    await expect(page.locator('meta[property="og:title"], meta[name="twitter:title"]')).toHaveCount(2);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
    expect(errors).toEqual([]);
    page.off('console', listener);
  }
});

test('mobile layouts fit and every visible control is at least 44 by 44 pixels', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  for (const path of ['/', '/play', '/demo', '/privacy', '/terms', '/missing-page']) {
    await page.goto(`${origin}${path}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const targets = page.locator('a, button, label[for]');
    for (let index = 0; index < await targets.count(); index += 1) {
      const target = targets.nth(index);
      if (!(await target.isVisible())) continue;
      const box = await target.boundingBox();
      expect.soft(box?.width, `${path}: ${await target.textContent()} width`).toBeGreaterThanOrEqual(44);
      expect.soft(box?.height, `${path}: ${await target.textContent()} height`).toBeGreaterThanOrEqual(44);
    }
  }
  await context.close();
});

test('the first desktop and phone viewport contains the exact sample action, outcome, and an operable contract', async ({ browser }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, isMobile: viewport.width === 390, hasTouch: viewport.width === 390 });
    const page = await context.newPage();
    await page.goto(`${origin}/`);
    await expect(page.getByRole('heading', { level: 1, name: 'Finish a six-chapter factory campaign' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeInViewport();
    await expect(page.getByText('Opens chapter two with a complete route. Demo changes never touch your campaign.')).toBeInViewport();
    const firstTicket = page.locator('[data-contract]').first();
    await expect(firstTicket).toBeInViewport();
    await firstTicket.click();
    await expect(page.getByRole('heading', { name: 'Machine cards' })).toBeVisible();
    await context.close();
  }
});

test('unknown paths return a complete designed HTTP 404 page', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const response = await page.goto('/missing-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This route reaches an empty bench' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://finite-foundry.sociobot.in/404');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Built by Param Factory/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Turn sound off' })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('history navigation restores routes and focuses their headings', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveTitle('Privacy — Finite Foundry');
  await page.goBack();
  await expect(page).toHaveTitle('Finite Foundry — Finish a factory campaign');
  await expect(page.locator('h1')).toBeFocused();
});

test('keyboard controls place, move between, and clear route slots', async ({ page }) => {
  await page.goto('/play');
  await chooseLowestQuota(page);
  await page.locator('[data-machine="cutter"]').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('1');
  await expect(page.locator('[data-slot="0"]')).toHaveAttribute('aria-label', /Cutter/);
  await page.locator('[data-slot="0"]').focus();
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => (document.activeElement as HTMLElement).dataset.slot)).toBe('1');
  await page.locator('[data-slot="0"]').focus();
  await page.keyboard.press('Delete');
  await expect(page.locator('[data-slot="0"]')).toHaveAttribute('aria-label', /empty/);
});
