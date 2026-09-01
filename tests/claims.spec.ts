import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

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
  const minimum = Math.min(...quotas);
  await clickNow(tickets.nth(quotas.indexOf(minimum)));
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

test('@claim:campaign-ending @claim:finite-free-run completes all six chapters and restarts', async ({ page }) => {
  await startFullDemo(page);
  for (let chapter = 0; chapter < 6; chapter += 1) {
    await expect(page.getByText(`Chapter ${chapter + 1} of 6`)).toBeVisible();
    await chooseLowestQuota(page);
    await placeRoute(page, solutions[chapter]!);
    await clickNow(page.locator('[data-action="start-shift"]'));
    await expect(page.getByRole('heading', { name: 'Contract complete' })).toBeVisible();
    await clickNow(page.locator('[data-action="next-chapter"]'));
  }
  while (await page.locator('[data-dismantle]').count()) await clickNow(page.locator('[data-dismantle]').first());
  await clickNow(page.locator('[data-action="finish-campaign"]'));
  await expect(page.getByRole('heading', { level: 1, name: 'You finished the foundry' })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await clickNow(page.locator('.ending [data-action="new-campaign"]'));
  await expect(page.getByText('Chapter 1 of 6')).toBeVisible();
});

test('@claim:local-save-pause saves a running shift and resumes it paused', async ({ page }) => {
  await startFullDemo(page, false);
  await chooseLowestQuota(page);
  await placeRoute(page, solutions[0]);
  await clickNow(page.locator('[data-action="start-shift"]'));
  await page.waitForTimeout(1300);
  const before = await page.locator('[data-timer]').textContent();
  await page.reload();
  await expect(page.locator('[data-action="resume-shift"]')).toBeVisible();
  const afterReload = await page.locator('[data-timer]').textContent();
  await page.waitForTimeout(800);
  expect(await page.locator('[data-timer]').textContent()).toBe(afterReload);
  const seconds = (value: string | null) => {
    const [minutes = 0, remaining = 0] = (value ?? '0:0').split(':').map(Number);
    return minutes * 60 + remaining;
  };
  expect(seconds(afterReload)).toBeGreaterThanOrEqual(seconds(before) - 1);
});

test('@claim:export-json exports a readable campaign record', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-action="export-save"]').click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let content = '';
  for await (const chunk of stream) content += chunk.toString();
  const record = JSON.parse(content) as { product: string; campaign: { seed: number } };
  expect(record.product).toBe('finite-foundry');
  expect(record.campaign.seed).toBe(240319);
});

test('@claim:demo-isolation keeps sample data separate and sends no cross-origin requests', async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4174') outsideRequests.push(request.url());
  });
  await page.goto('/demo');
  await page.evaluate(() => localStorage.setItem('finite-foundry:marker', 'real-campaign'));
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.locator('[data-action="reset-demo"]').click();
  expect(await page.evaluate(() => localStorage.getItem('finite-foundry:marker'))).toBe('real-campaign');
  await page.locator('[data-action="start-real"]').click();
  expect(await page.evaluate(() => localStorage.getItem('demo:finite-foundry:save'))).toBeNull();
  expect(outsideRequests).toEqual([]);
});

test('@claim:offline-reload reloads the demo without a network', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4174/demo');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Make room for heat' })).toBeVisible();
  await context.close();
});

test('@claim:sound-setting keeps the mute choice after reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Sound on' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sound off' })).toBeVisible();
});

test('@claim:purchase-availability keeps bonus contracts honestly unavailable before registration', async ({ page }) => {
  await page.goto('/demo');
  await page.goto('/terms');
  await expect(page.getByText('Bonus contracts are unavailable while operator registration is pending.')).toBeVisible();
  await expect(page.locator('a[href*="checkout"], form[data-form="restore-license"], [data-bonus]')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('$5');
});

test('@claim:shift-duration exposes a five-minute simulated shift in the demo', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Clock', { exact: true })).toBeVisible();
  await expect(page.getByText('5:00 simulated')).toBeVisible();
  await expect(page.locator('[data-timer]')).toHaveText('5:00');
});

test('@claim:seeded-contracts gives the full demo three named contract choices', async ({ page }) => {
  await startFullDemo(page);
  await expect(page.locator('[data-contract]')).toHaveCount(3);
  await expect(page.locator('[data-contract]').first()).toContainText('units');
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
  await touchPage.goto('http://127.0.0.1:4174/demo');
  await touchPage.locator('[data-action="clear-route"]').tap();
  await touchPage.locator('[data-machine="cutter"]').tap();
  await touchPage.locator('[data-slot="0"]').tap();
  await expect(touchPage.locator('[data-slot="0"]')).toHaveAttribute('aria-label', /Cutter/);
  await context.close();
});

test('@claim:normal-play-privacy sends no game data to another origin', async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4174') outsideRequests.push(request.url());
  });
  await page.goto('/demo');
  await page.goto('/');
  await page.locator('[data-contract]').first().click();
  await page.locator('[data-machine="cutter"]').click();
  await page.locator('[data-slot="0"]').click();
  expect(outsideRequests).toEqual([]);
});

test('@claim:frame-rate keeps active demo animation within a 34ms p95 frame interval', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Run five-minute shift' }).click();
  const p95 = await page.evaluate(() => new Promise<number>((resolve) => {
    const frames: number[] = [];
    let previous = performance.now();
    const sample = (now: number) => {
      frames.push(now - previous);
      previous = now;
      if (frames.length === 90) {
        frames.sort((a, b) => a - b);
        resolve(frames[Math.floor(frames.length * 0.95)]!);
      } else requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
  expect(p95).toBeLessThanOrEqual(34);
});

test('@claim:demo-paths serves the documented demo URLs with the sample banner', async ({ page }) => {
  for (const path of ['/demo', '/?demo=1']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  }
});

test('semantic and accessibility checks pass on key routes', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms']) {
    const errors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
    expect(errors).toEqual([]);
  }
});

test('the game fits a 390px viewport without page overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4174/demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await context.close();
});

test('the first desktop and phone viewport contains an operable game contract choice', async ({ browser }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, isMobile: viewport.width === 390, hasTouch: viewport.width === 390 });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4174/');
    await expect(page.getByRole('heading', { level: 1, name: 'Finish a six-chapter factory campaign' })).toBeVisible();
    const firstTicket = page.locator('[data-contract]').first();
    const box = await firstTicket.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(viewport.height);
    await firstTicket.click();
    await expect(page.getByRole('heading', { name: 'Machine cards' })).toBeVisible();
    await context.close();
  }
});

test('all phone controls meet the 44px touch-target floor', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4174/demo');
  const targets = page.locator('.site-header a, .site-footer a, [data-action="new-campaign"], [data-action="reset-demo"], [data-action="full-demo"], [data-action="start-real"]');
  for (let index = 0; index < await targets.count(); index += 1) {
    const box = await targets.nth(index).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await context.close();
});

test('unknown paths return the designed page with HTTP 404', async ({ page }) => {
  const response = await page.goto('/missing-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This route reaches an empty bench' })).toBeVisible();
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
