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

test('@claim:campaign-ending @claim:finite-free-run completes all six chapters and restarts', async ({ page }) => {
  await page.goto('/play?test=1');
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
  await expect(page.locator('main a[href*="checkout"]')).toHaveCount(1);
  page.once('dialog', (dialog) => dialog.accept());
  await clickNow(page.locator('.ending [data-action="new-campaign"]'));
  await expect(page.getByText('Chapter 1 of 6')).toBeVisible();
});

test('@claim:local-save-pause saves a running shift and resumes it paused', async ({ page }) => {
  await page.goto('/play');
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
  expect(afterReload).toBe(before);
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
  await page.goto('/play');
  await page.evaluate(() => localStorage.setItem('finite-foundry:marker', 'real-campaign'));
  await page.goto('/?demo=1');
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

test('@claim:bonus-contracts shows twelve playable orders with a valid cached license', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Add twelve bonus contracts for $5 once' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy bonus contracts — $5 at Sociobot' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/finite-foundry/checkout');
  await page.goto('/play');
  await page.evaluate(() => {
    localStorage.setItem('sb_license:finite-foundry', 'test-token');
    localStorage.setItem('sb_license_cache:finite-foundry', JSON.stringify({ valid: true, checkedAt: Date.now() }));
    localStorage.setItem('finite-foundry:save', JSON.stringify({
      version: 1, seed: 42, chapterIndex: 5, completedChapters: 6, selectedContractId: null,
      route: [null, null, null, null, null, null], pace: 'steady', status: 'ending', remainingMs: 0,
      produced: 25, batchProgressMs: 0, attempts: 6, history: [], updatedAt: Date.now()
    }));
  });
  await page.reload();
  await expect(page.locator('[data-bonus]')).toHaveCount(12);
  await page.locator('[data-bonus]').first().click();
  await expect(page.getByText('Midnight Tram Shed')).toBeVisible();
  await expect(page.getByText('Chapter 1 of 6')).toBeVisible();
});

test('semantic and accessibility checks pass on key routes', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
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
