import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'https://finite-foundry.sociobot.in';
const out = '.factory/evidence-polish-1';
const results = {};
const failures = [];
const solutions = [
  ['cutter', 'press'],
  ['cutter', 'kiln', 'cooler', 'press'],
  ['sorter', 'press', 'assembler'],
  ['sorter', 'press', 'buffer', 'kiln', 'assembler'],
  ['cutter', 'splitter', 'press', 'assembler', 'recycler'],
  ['cutter', 'sorter', 'press', 'kiln', 'assembler', 'recycler']
];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function clickNow(locator) {
  await locator.evaluate((element) => element.click());
}

async function chooseLowest(page) {
  const tickets = page.locator('[data-contract]');
  const labels = await tickets.allTextContents();
  const quotas = labels.map((label) => Number(label.match(/(\d+) units/)?.[1] ?? 999));
  await clickNow(tickets.nth(quotas.indexOf(Math.min(...quotas))));
}

await mkdir(out, { recursive: true });
const browser = await chromium.launch();

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();
const consoleErrors = [];
const outsideRequests = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('request', (request) => { if (new URL(request.url()).origin !== base) outsideRequests.push(request.url()); });

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
check(await page.title() === 'Finite Foundry — Finish a factory campaign', 'home title');
check(await page.locator('h1').count() === 1, 'home h1 count');
check(await page.getByRole('link', { name: 'Try it with sample data' }).isVisible(), 'sample action');
check(await page.getByText('Opens chapter two with a complete route. Demo changes never touch your campaign.').isVisible(), 'sample outcome');
check((await page.locator('[data-contract]').first().boundingBox())?.y < 900, 'desktop contract in first viewport');
await page.screenshot({ path: `${out}/live-cold-desktop.png`, fullPage: true });

for (const [path, title] of [['/play', 'Play — Finite Foundry'], ['/demo', 'Demo — Finite Foundry'], ['/privacy', 'Privacy — Finite Foundry'], ['/terms', 'Terms — Finite Foundry']]) {
  const response = await page.goto(`${base}${path}`);
  check(response?.status() === 200, `${path} status`);
  check(await page.title() === title, `${path} title`);
  check(await page.locator('h1').count() === 1, `${path} h1 count`);
  check(await page.locator('main').count() === 1, `${path} main count`);
  const axe = await new AxeBuilder({ page }).analyze();
  check(!axe.violations.some(({ impact }) => impact === 'serious' || impact === 'critical'), `${path} axe`);
}

const missing = await page.goto(`${base}/definitely-missing`);
check(missing?.status() === 404, '404 status');
check(await page.locator('link[rel="canonical"]').getAttribute('href') === `${base}/404`, '404 canonical');
check(await page.locator('meta[property="og:title"]').count() === 1, '404 Open Graph');
check(await page.locator('link[rel="apple-touch-icon"]').count() === 1, '404 touch icon');
check(await page.getByRole('link', { name: /Built by Param Factory/ }).isVisible(), '404 factory link');
const axe404 = await new AxeBuilder({ page }).analyze();
check(!axe404.violations.some(({ impact }) => impact === 'serious' || impact === 'critical'), '404 axe');

await page.goto(`${base}/demo?test=1`);
check(await page.getByText('Demo — sample data, nothing is saved').isVisible(), 'demo banner');
check(await page.getByText('Chapter 2 of 6').isVisible(), 'demo chapter two');
check(await page.locator('[data-slot].filled').count() === 4, 'demo complete route');
await page.getByRole('button', { name: 'Play full demo' }).click();
for (let chapter = 0; chapter < 6; chapter += 1) {
  await chooseLowest(page);
  for (const [index, machine] of solutions[chapter].entries()) {
    await clickNow(page.locator(`[data-machine="${machine}"]`));
    await clickNow(page.locator(`[data-slot="${index}"]`));
  }
  await clickNow(page.locator('[data-action="start-shift"]'));
  await page.getByRole('heading', { name: 'Contract complete' }).waitFor();
  await clickNow(page.locator('[data-action="next-chapter"]'));
}
while (await page.locator('[data-dismantle]').count()) await clickNow(page.locator('[data-dismantle]').first());
await clickNow(page.locator('[data-action="finish-campaign"]'));
check(await page.getByRole('heading', { name: 'You finished the foundry' }).isVisible(), 'campaign ending');
await page.screenshot({ path: `${out}/live-demo-ending.png`, fullPage: true });

await page.goto(`${base}/play`);
await page.locator('[data-contract]').first().click();
const realSave = await page.evaluate(() => localStorage.getItem('finite-foundry:save'));
await page.goto(`${base}/?demo=1`);
check(await page.getByText('Demo — sample data, nothing is saved').isVisible(), 'query demo entry');
await page.getByRole('button', { name: 'Turn sound off' }).click();
await page.getByRole('button', { name: 'Play full demo' }).click();
await page.getByRole('button', { name: 'Reset demo' }).click();
check(await page.evaluate(() => localStorage.getItem('finite-foundry:save')) === realSave, 'demo preserves real save');
await page.getByRole('link', { name: 'Start for real' }).click();
check(await page.evaluate(() => localStorage.getItem('finite-foundry:save')) === realSave, 'demo exit preserves real save');
check(await page.evaluate(() => localStorage.getItem('demo:finite-foundry:save')) === null, 'demo exit clears demo save');
check(await page.evaluate(() => localStorage.getItem('demo:finite-foundry:mute')) === null, 'demo exit clears demo sound setting');

await page.goto(`${base}/demo`);
await page.getByRole('button', { name: 'Reset demo' }).click();
const downloadEvent = page.waitForEvent('download');
await page.locator('[data-action="export-save"]').first().click();
const download = await downloadEvent;
const downloadPath = await download.path();
await page.getByRole('button', { name: 'Play full demo' }).click();
await page.setInputFiles('[data-action="import-file"]', downloadPath);
await page.getByRole('heading', { name: 'Replace this campaign?' }).waitFor();
check(await page.getByRole('heading', { name: 'Replace this campaign?' }).isVisible(), 'import preview');
await page.getByRole('button', { name: 'Replace with imported campaign' }).click();
await page.getByText('Chapter 2 of 6').waitFor();
check(await page.getByText('Chapter 2 of 6').isVisible(), 'import restore');

await page.goto(`${base}/demo`);
await page.getByRole('button', { name: 'Run five-minute shift' }).click();
const p95 = await page.evaluate(() => new Promise((resolve) => {
  const frames = [];
  let previous = performance.now();
  const sample = (now) => {
    frames.push(now - previous);
    previous = now;
    if (frames.length === 120) {
      frames.sort((a, b) => a - b);
      resolve(frames[Math.floor(frames.length * 0.95)]);
    } else requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
}));
check(p95 <= 20, `frame p95 ${p95}`);

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const phone = await mobile.newPage();
await phone.goto(`${base}/`, { waitUntil: 'networkidle' });
check(await phone.getByRole('link', { name: 'Try it with sample data' }).isVisible(), 'mobile sample action');
check(await phone.getByText('Opens chapter two with a complete route. Demo changes never touch your campaign.').isVisible(), 'mobile sample outcome');
check((await phone.locator('[data-contract]').first().boundingBox())?.y < 844, 'mobile contract in first viewport');
check(await phone.evaluate(() => document.documentElement.scrollWidth) <= 390, 'mobile overflow');
const smallTargets = await phone.locator('a, button').evaluateAll((nodes) => nodes.filter((node) => {
  const box = node.getBoundingClientRect();
  return box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44);
}).map((node) => node.textContent?.trim()));
check(smallTargets.length === 0, `small mobile targets: ${smallTargets.join(', ')}`);
await phone.screenshot({ path: `${out}/live-cold-mobile.png`, fullPage: true });
for (const path of ['/play', '/demo', '/privacy', '/terms', '/definitely-missing']) {
  await phone.goto(`${base}${path}`);
  check(await phone.evaluate(() => document.documentElement.scrollWidth) <= 390, `${path} mobile overflow`);
  const routeSmallTargets = await phone.locator('a, button').evaluateAll((nodes) => nodes.filter((node) => {
    const box = node.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44);
  }).map((node) => node.textContent?.trim()));
  check(routeSmallTargets.length === 0, `${path} small mobile targets: ${routeSmallTargets.join(', ')}`);
}

const offline = await browser.newContext({ serviceWorkers: 'allow' });
const offlinePage = await offline.newPage();
await offlinePage.goto(`${base}/demo`);
await offlinePage.evaluate(async () => {
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
});
await offlinePage.reload();
await offline.setOffline(true);
await offlinePage.reload();
check(await offlinePage.getByText('Demo — sample data, nothing is saved').isVisible(), 'offline demo reload');

results.liveUrl = base;
results.checkedAt = new Date().toISOString();
results.consoleErrors = consoleErrors.filter((message) => !/Failed to load resource:.*404/.test(message));
results.crossOriginRequests = outsideRequests;
results.frameP95Ms = Number(p95.toFixed(2));
results.failures = failures;
await writeFile(`${out}/live-check.json`, JSON.stringify(results, null, 2));
await offline.close();
await mobile.close();
await desktop.close();
await browser.close();

console.log(JSON.stringify(results, null, 2));
if (failures.length || results.consoleErrors.length || outsideRequests.length) process.exit(1);
