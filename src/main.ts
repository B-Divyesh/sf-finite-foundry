import './style.css';
import {
  activeRoute,
  BONUS_CONTRACTS,
  CHAPTERS,
  contractsForChapter,
  createGame,
  forecastOutput,
  formatTime,
  GameState,
  MACHINES,
  MachineId,
  nextChapter,
  Pace,
  routePower,
  selectedContract,
  SHIFT_MS,
  stepSimulation,
  validatePlan
} from './core';
import { getLicenseStatus, initializeLicense, restoreLicense } from './license';

const app = document.querySelector<HTMLDivElement>('#app')!;
const isDemoPath = () => location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
const isTestClock = () => new URLSearchParams(location.search).get('test') === '1';
const storageKey = () => isDemoPath() ? 'demo:finite-foundry:save' : 'finite-foundry:save';
const muteKey = () => isDemoPath() ? 'demo:finite-foundry:mute' : 'finite-foundry:mute';

let gameState: GameState | null = null;
let selectedMachine: MachineId | null = null;
let storageError = '';
let lastFrame = performance.now();
let accumulator = 0;
let lastDisplayUpdate = 0;
let lastSaveUpdate = 0;
let muted = false;
let audioContext: AudioContext | null = null;

function safeLoad(): GameState | null {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== 1 || !CHAPTERS[parsed.chapterIndex] || !Array.isArray(parsed.route)) return null;
    if (parsed.status === 'running') parsed.status = 'paused';
    return parsed;
  } catch {
    storageError = 'The saved campaign could not be read. Choose New campaign to replace it.';
    return null;
  }
}

function saveGame(): void {
  if (!gameState) return;
  try {
    gameState.updatedAt = Date.now();
    localStorage.setItem(storageKey(), JSON.stringify(gameState));
    storageError = '';
  } catch {
    storageError = 'This browser blocked local saving. Export the campaign record before closing the page.';
  }
}

function loadMute(): void {
  try {
    muted = localStorage.getItem(muteKey()) === 'true';
  } catch {
    muted = false;
  }
}

function playTone(kind: 'place' | 'start' | 'win' | 'remove'): void {
  if (muted) return;
  try {
    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = kind === 'win' ? 'triangle' : 'square';
    oscillator.frequency.value = kind === 'win' ? 520 : kind === 'remove' ? 130 : kind === 'start' ? 220 : 170;
    gain.gain.setValueAtTime(0.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + (kind === 'win' ? 0.32 : 0.08));
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + (kind === 'win' ? 0.34 : 0.1));
  } catch {
    // Sound is optional and never blocks play.
  }
}

const routeMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Finite Foundry — Finish a factory campaign',
    description: 'Plan six factory routes, run five-minute simulated shifts, and finish a campaign with no prestige or cash shop.'
  },
  '/play': {
    title: 'Play — Finite Foundry',
    description: 'Plan the next machine route and run a five-minute simulated production shift.'
  },
  '/demo': {
    title: 'Demo — Finite Foundry',
    description: 'Try a complete sample route. Demo progress stays separate and is not saved to your campaign.'
  },
  '/privacy': {
    title: 'Privacy — Finite Foundry',
    description: 'How Finite Foundry stores campaign progress and checks optional licenses.'
  },
  '/terms': {
    title: 'Terms — Finite Foundry',
    description: 'Terms for playing Finite Foundry and buying the optional contract set.'
  },
  '/404': {
    title: 'Page not found — Finite Foundry',
    description: 'This page does not exist. Return to Finite Foundry.'
  }
};

function setMeta(path: string): void {
  const meta = routeMeta[path] ?? routeMeta['/404']!;
  document.title = meta.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = meta.description;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = `https://finite-foundry.sociobot.in${path === '/' ? '/' : path}`;
}

function header(): string {
  return `
    <div id="route-announcer" class="sr-only" role="status" aria-live="polite"></div>
    <header class="site-header">
      <a class="wordmark" href="/" data-link aria-label="Finite Foundry home"><span aria-hidden="true">FF</span> Finite Foundry</a>
      <nav aria-label="Main navigation">
        <a href="/play" data-link>Play</a>
        <a href="/demo" data-link>Demo</a>
        <a href="/privacy" data-link>Privacy</a>
      </nav>
      <button class="sound-button" type="button" data-action="sound" aria-pressed="${muted}">${muted ? 'Sound off' : 'Sound on'}</button>
    </header>${navigator.onLine ? '' : '<div class="network-notice" role="status">Offline. The campaign still works; license checks wait for a connection.</div>'}`;
}

function footer(): string {
  return `
    <footer class="site-footer">
      <p>Plan six routes. Finish the machine.</p>
      <nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://hello-factory.sociobot.in">Built by Param Factory <span class="sr-only">(external site)</span></a></nav>
      <p class="build">Version 1.0.0 · Original generated artwork</p>
    </footer>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span>Chapter two uses a 10× clock.</span><button type="button" data-action="reset-demo">Reset demo</button><a href="/play" data-action="start-real">Start for real</a></aside>`;
}

function landing(): string {
  const license = getLicenseStatus();
  return `${header()}
    <main id="main">
      <section class="hero paper-section">
        <div class="hero-copy">
          <p class="eyebrow">A finite incremental game</p>
          <h1 tabindex="-1">Finish a six-chapter factory campaign</h1>
          <p class="lede">For production-game players who want clear plans, useful pauses, and an ending.</p>
          <div class="hero-actions">
            <a class="button primary" href="/demo" data-link>Try it with sample data</a>
            <span>Opens chapter two with a complete route.</span>
          </div>
          <a class="text-action" href="/play" data-link>Start a new campaign</a>
          <ul class="plain-facts" aria-label="Game facts">
            <li>Campaign saves in this browser</li>
            <li>Works offline after the first visit</li>
            <li>Full campaign is free</li>
          </ul>
        </div>
        <figure class="hero-art">
          <picture>
            <source media="(max-width: 700px)" srcset="/assets/foundry-hero-768.webp" />
            <img src="/assets/foundry-hero-1280.webp" width="1280" height="853" alt="A compact paper factory shows the kind of route you will build." fetchpriority="high" decoding="async" />
          </picture>
          <figcaption class="hero-route-card"><span>Sample route ready</span><ol><li>CUT</li><li>HEAT</li><li>COOL</li><li>PRESS</li></ol><strong>Forecast: 25 / 23 units</strong></figcaption>
        </figure>
      </section>

      <section class="live-preview" aria-labelledby="preview-title">
        <div>
          <p class="chapter-stamp">Chapter 2 of 6</p>
          <h2 id="preview-title">See the route before you run it</h2>
          <p>The recipe needs heat. A cooling rack keeps the press safe.</p>
        </div>
        <ol class="preview-route" aria-label="Sample production route">
          <li><span>1</span><strong>Cutter</strong><small>2 kW</small></li>
          <li><span>2</span><strong>Kiln</strong><small>4 kW</small></li>
          <li class="utility"><span>3</span><strong>Cooling rack</strong><small>1 kW</small></li>
          <li><span>4</span><strong>Press</strong><small>3 kW</small></li>
        </ol>
        <div class="preview-readout"><span>Forecast</span><strong>25 / 23 units</strong><span>Simulated shift: 5:00</span></div>
      </section>

      <section class="steps paper-section" aria-labelledby="steps-title">
        <h2 id="steps-title">How the campaign works</h2>
        <ol>
          <li><span>01</span><div><h3>Choose a contract</h3><p>Each run gives you three seeded orders with different quotas.</p></div></li>
          <li><span>02</span><div><h3>Plan a safe route</h3><p>Place machines in recipe order. One new rule appears each chapter.</p></div></li>
          <li><span>03</span><div><h3>Run and finish</h3><p>Production pauses with the tab. The sixth shift ends the campaign.</p></div></li>
        </ol>
      </section>

      <section class="promise" aria-labelledby="promise-title">
        <div><h2 id="promise-title">What the game leaves out</h2><p>No prestige resets, offline accrual, ads, energy limits, loot boxes, or paid progress.</p></div>
        <div class="privacy-note"><h3>Your campaign stays local</h3><p>The game saves in your browser. You can export a copy at any time.</p></div>
      </section>

      <section class="paid paper-section" id="bonus" aria-labelledby="paid-title">
        <div>
          <p class="eyebrow">Optional contract set</p>
          <h2 id="paid-title">Add twelve bonus contracts for $5 once</h2>
          <p>The free campaign stays complete. The bonus set adds harder seeded orders after the ending.</p>
          <p class="license-state" aria-live="polite">${license === 'unlocked' ? 'Bonus contracts are active on this device.' : license === 'inactive' ? 'This license is no longer active.' : license === 'checking' ? 'Checking the saved license…' : 'No bonus license is saved on this device.'}</p>
        </div>
        <div class="purchase-actions">
          <a class="button primary" href="https://api.sociobot.in/api/v1/products/finite-foundry/checkout">Buy bonus contracts — $5 at Sociobot</a>
          <form data-form="restore-license">
            <label for="license-token">Have a license?</label>
            <div><input id="license-token" name="license" autocomplete="off" required /><button type="submit">Restore license</button></div>
            <p class="form-result" aria-live="polite"></p>
          </form>
        </div>
      </section>
    </main>${footer()}`;
}

function contractPicker(state: GameState): string {
  const contracts = contractsForChapter(state.seed, state.chapterIndex);
  return `<section class="contract-picker" aria-labelledby="contract-title">
    <div><p class="eyebrow">Choose one order</p><h2 id="contract-title">Available contracts</h2><p>Lower quotas leave more room for a slower pace.</p></div>
    <div class="contract-list">${contracts.map((contract) => `
      <button type="button" class="contract-ticket" data-contract="${contract.id}">
        <span aria-hidden="true">${contract.mark}</span><strong>${contract.client}</strong><span>${contract.product}</span><b>${contract.quota} units</b>
      </button>`).join('')}</div>
  </section>`;
}

function machineBank(state: GameState, disabled: boolean): string {
  const chapter = CHAPTERS[state.chapterIndex]!;
  return `<section class="machine-bank" aria-labelledby="machines-title">
    <div><h2 id="machines-title">Machine cards</h2><p>Choose a machine, then choose a numbered route slot.</p></div>
    <div class="machine-cards">${chapter.available.map((id) => {
      const machine = MACHINES[id];
      const placed = state.route.includes(id);
      return `<button type="button" class="machine-card ${selectedMachine === id ? 'selected' : ''}" data-machine="${id}" aria-pressed="${selectedMachine === id}" ${disabled ? 'disabled' : ''}>
        <span class="machine-code">${machine.short}</span><strong>${machine.name}</strong><span>${machine.power} kW</span><small>${placed ? 'Placed · choose to move' : machine.detail}</small>
      </button>`;
    }).join('')}</div>
  </section>`;
}

function routeBoard(state: GameState, disabled: boolean): string {
  return `<section class="route-board" aria-labelledby="route-title">
    <div class="section-heading"><div><h2 id="route-title">Production route</h2><p>Recipe: ${CHAPTERS[state.chapterIndex]!.recipe.map((id) => MACHINES[id].name).join(' → ')}</p></div><button type="button" class="quiet" data-action="clear-route" ${disabled ? 'disabled' : ''}>Clear route</button></div>
    <ol class="route-slots">${state.route.map((id, index) => `<li>
      <button type="button" class="route-slot ${id ? 'filled' : ''}" data-slot="${index}" ${disabled ? 'disabled' : ''} aria-label="Route slot ${index + 1}${id ? `, ${MACHINES[id].name}. Choose to remove.` : ', empty'}">
        <span class="slot-number">${index + 1}</span>${id ? `<span class="route-code">${MACHINES[id].short}</span><strong>${MACHINES[id].name}</strong><small>${MACHINES[id].power} kW</small>` : '<strong>Empty slot</strong><small>Choose a machine first</small>'}
      </button>
    </li>`).join('')}</ol>
  </section>`;
}

function planPanel(state: GameState): string {
  const chapter = CHAPTERS[state.chapterIndex]!;
  const contract = selectedContract(state)!;
  const problems = validatePlan(state);
  const forecast = forecastOutput(state);
  const enough = forecast >= contract.quota;
  const disabled = state.status === 'running' || state.status === 'paused';
  const progress = Math.min(100, Math.floor((Math.floor(state.produced) / contract.quota) * 100));
  return `<section class="control-panel" aria-labelledby="shift-title">
    <div class="constraint"><span>New constraint</span><strong>${chapter.constraint}</strong></div>
    <div class="controls-grid">
      <fieldset ${disabled ? 'disabled' : ''}>
        <legend>Pace</legend>
        ${(['lean', 'steady', 'brisk'] as Pace[]).map((pace) => `<label><input type="radio" name="pace" value="${pace}" ${state.pace === pace ? 'checked' : ''} /> <span>${pace[0]!.toUpperCase() + pace.slice(1)}</span></label>`).join('')}
      </fieldset>
      <dl class="plan-numbers">
        <div><dt>Power</dt><dd>${routePower(state)}${chapter.powerCap ? ` / ${chapter.powerCap}` : ''} kW</dd></div>
        <div><dt>Forecast</dt><dd>${forecast} / ${contract.quota} units</dd></div>
        <div><dt>Clock</dt><dd>5:00 simulated</dd></div>
      </dl>
    </div>
    <div class="plan-check ${problems.length ? 'has-problem' : enough ? 'ready' : 'has-warning'}" aria-live="polite">
      ${problems.length ? `<strong>Route needs work.</strong><ul>${problems.map((problem) => `<li>${problem}</li>`).join('')}</ul>` : enough ? '<strong>Plan can meet the quota.</strong><p>Start the simulated shift when you are ready.</p>' : `<strong>Forecast is ${contract.quota - forecast} units short.</strong><p>You may run it and retry after a missed quota.</p>`}
    </div>
    <div class="shift-readout" aria-live="polite">
      <div><span>Simulated time left</span><strong data-timer>${formatTime(state.remainingMs)}</strong>${isDemoPath() ? '<small>Demo clock runs 10× faster.</small>' : ''}${isTestClock() ? '<small>Test clock is active.</small>' : ''}</div>
      <div><span>Finished units</span><strong><span data-produced>${Math.floor(state.produced)}</span> / ${contract.quota}</strong></div>
    </div>
    <progress class="progress-track" data-progress aria-label="Contract production" max="${contract.quota}" value="${Math.floor(state.produced)}">${progress}%</progress>
    <div class="shift-actions">
      ${state.status === 'planning' ? `<button type="button" class="button primary" data-action="start-shift" ${problems.length ? 'disabled' : ''}>${enough ? 'Run five-minute shift' : 'Run shift anyway'}</button>` : ''}
      ${state.status === 'running' ? '<button type="button" class="button" data-action="pause-shift">Pause shift</button>' : ''}
      ${state.status === 'paused' ? '<button type="button" class="button primary" data-action="resume-shift">Resume shift</button><span>The timer stopped. No production happened while paused.</span>' : ''}
    </div>
  </section>`;
}

function resultPanel(state: GameState): string {
  const contract = selectedContract(state)!;
  if (state.status === 'won') return `<section class="result-panel won" aria-labelledby="result-title"><p class="result-mark" aria-hidden="true">✓</p><div><h2 id="result-title">Contract complete</h2><p>You made ${Math.floor(state.produced)} units for ${contract.client}.</p></div><button class="button primary" type="button" data-action="next-chapter">${state.bonusMode ? 'Return to bonus contracts' : state.chapterIndex === 5 ? 'Dismantle the machine' : 'Plan the next chapter'}</button></section>`;
  if (state.status === 'lost') return `<section class="result-panel lost" aria-labelledby="result-title"><p class="result-mark" aria-hidden="true">×</p><div><h2 id="result-title">Quota missed</h2><p>You made ${Math.floor(state.produced)} of ${contract.quota} units. Change the pace or choose another contract.</p></div><button class="button primary" type="button" data-action="retry-shift">Replan this shift</button></section>`;
  return '';
}

function dismantlePanel(state: GameState): string {
  const remaining = activeRoute(state);
  return `<section class="dismantle paper-section" aria-labelledby="dismantle-title"><div><p class="eyebrow">Final task</p><h2 id="dismantle-title">Dismantle every station</h2><p>The last contract is done. Remove each machine to close the factory.</p></div>
    <div class="dismantle-list">${state.route.map((id, index) => id ? `<button type="button" data-dismantle="${index}"><span>${MACHINES[id].short}</span>Dismantle ${MACHINES[id].name}</button>` : '').join('')}</div>
    ${remaining.length === 0 ? '<button class="button primary" type="button" data-action="finish-campaign">Finish the campaign</button>' : `<p>${remaining.length} ${remaining.length === 1 ? 'station remains' : 'stations remain'}.</p>`}
  </section>`;
}

function endingPanel(state: GameState): string {
  const unlocked = getLicenseStatus() === 'unlocked';
  return `<section class="ending paper-section" aria-labelledby="ending-title"><p class="ending-mark" aria-hidden="true">■ ● ▲</p><h2 id="ending-title">Six shifts. One finished machine.</h2><p>You completed every contract and took the foundry apart. There is no prestige reset.</p>
    <dl><div><dt>Campaign seed</dt><dd>${state.seed}</dd></div><div><dt>Contracts filled</dt><dd>${state.history.length}</dd></div><div><dt>Attempts</dt><dd>${state.attempts}</dd></div></dl>
    <div class="ending-actions"><button class="button primary" type="button" data-action="new-campaign">Start another campaign</button><button type="button" data-action="export-save">Export campaign record</button></div>
  </section>
  <section class="bonus-board" aria-labelledby="bonus-title"><div><p class="eyebrow">Optional set</p><h2 id="bonus-title">Twelve bonus contracts</h2><p>${unlocked ? 'Choose any harder one-shift order. Completed orders join this campaign record.' : 'A $5 one-time license adds twelve harder one-shift orders.'}</p></div>
    ${unlocked ? `<div class="bonus-list">${BONUS_CONTRACTS.map((contract, index) => `<button type="button" data-bonus="${index}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${contract.client}</strong><small>${contract.product} · ${contract.quota} units</small></button>`).join('')}</div>` : '<a class="button primary" href="https://api.sociobot.in/api/v1/products/finite-foundry/checkout">Buy bonus contracts — $5 at Sociobot</a>'}
  </section>`;
}

function gamePage(demo: boolean): string {
  gameState ??= safeLoad() ?? createGame(demo ? 240319 : Math.floor(Date.now() / 1000), demo);
  const state = gameState;
  const chapter = CHAPTERS[state.chapterIndex]!;
  const isEnding = state.status === 'ending';
  return `${header()}${demo ? demoBanner() : ''}<main id="main" class="game-main">
    <section class="game-heading">
      <div><p class="chapter-stamp">${isEnding ? 'Campaign complete' : `Chapter ${chapter.number} of 6`}</p><h1 tabindex="-1">${isEnding ? 'You finished the foundry' : chapter.title}</h1><p>${isEnding ? 'Your campaign record is ready to export.' : chapter.lesson}</p></div>
      <div class="campaign-tools"><span>Seed ${state.seed}</span><button type="button" data-action="export-save">Export save</button><button type="button" data-action="new-campaign">New campaign</button></div>
    </section>
    ${storageError ? `<div class="error-notice" role="alert">${storageError}</div>` : ''}
    ${state.status === 'ending' ? endingPanel(state) : state.status === 'dismantling' ? dismantlePanel(state) : !state.selectedContractId ? contractPicker(state) : `
      <section class="contract-strip" aria-label="Selected contract"><span>${selectedContract(state)?.mark}</span><div><b>${selectedContract(state)?.client}</b><small>${selectedContract(state)?.product}</small></div><strong>${selectedContract(state)?.quota} units</strong><button type="button" data-action="change-contract" ${state.status !== 'planning' ? 'disabled' : ''}>Change contract</button></section>
      ${machineBank(state, state.status !== 'planning')}
      ${routeBoard(state, state.status !== 'planning')}
      ${state.status === 'won' || state.status === 'lost' ? resultPanel(state) : planPanel(state)}
    `}
  </main>${footer()}`;
}

function privacyPage(): string {
  return `${header()}<main id="main" class="legal paper-section"><p class="eyebrow">Privacy</p><h1 tabindex="-1">Your campaign stays in your browser</h1><p>Finite Foundry stores your campaign, sound choice, and optional license in local storage.</p><h2>What leaves this device</h2><p>Nothing is sent during normal play. If you add a license, the game sends that token to Sociobot once per day for verification.</p><h2>Demo data</h2><p>The demo uses separate keys that start with <code>demo:</code>. Resetting or leaving the demo deletes those keys.</p><h2>Exports</h2><p>An exported campaign is a JSON file you control. It contains the seed, route progress, and completed contract names.</p><h2>Deletion</h2><p>Choose “New campaign” to replace the current save. Clear this site’s browser storage to remove every saved setting.</p><p>Last updated: September 1, 2026.</p></main>${footer()}`;
}

function termsPage(): string {
  return `${header()}<main id="main" class="legal paper-section"><p class="eyebrow">Terms</p><h1 tabindex="-1">Terms for playing Finite Foundry</h1><p>You may play, save, and export the game for personal use. The software is provided under the MIT License.</p><h2>Optional purchase</h2><p>The $5 purchase is a one-time license for twelve bonus contracts. The six-chapter campaign remains free.</p><p>Sociobot and Dodo are the merchant of record. They handle payment and refunds. A refunded license stops working.</p><h2>Availability</h2><p>The game works without an account. Browser changes or cleared storage can remove local progress, so export records you want to keep.</p><h2>Fair play</h2><p>Do not use the site to disrupt the service or test stolen license tokens.</p><p>Last updated: September 1, 2026.</p></main>${footer()}`;
}

function notFoundPage(): string {
  return `${header()}<main id="main" class="not-found"><div><p class="eyebrow">404</p><h1 tabindex="-1">This route reaches an empty bench</h1><p>The page does not exist. Your saved campaign is unchanged.</p><a class="button primary" href="/" data-link>Return to the foundry</a></div><div class="empty-machine" aria-hidden="true"><span></span><span></span><span></span></div></main>${footer()}`;
}

function render(announce = false): void {
  loadMute();
  const path = location.pathname;
  const queryDemo = path === '/' && isDemoPath();
  const known = Object.hasOwn(routeMeta, path);
  const normalizedPath = queryDemo ? '/demo' : known ? path : '/404';
  setMeta(normalizedPath);
  if (path !== '/play' && path !== '/demo' && !queryDemo) gameState = null;
  app.innerHTML = queryDemo ? gamePage(true) : path === '/' ? landing() : path === '/play' ? gamePage(false) : path === '/demo' ? gamePage(true) : path === '/privacy' ? privacyPage() : path === '/terms' ? termsPage() : notFoundPage();
  bindEvents();
  if (announce) {
    scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLHeadingElement>('h1');
      const announcer = document.querySelector<HTMLElement>('#route-announcer');
      heading?.focus();
      if (announcer && heading) announcer.textContent = heading.textContent;
    });
  }
}

function navigate(path: string): void {
  if (isDemoPath() && path !== '/demo') {
    try { localStorage.removeItem('demo:finite-foundry:save'); } catch { /* Storage may be unavailable. */ }
  }
  history.pushState({}, '', path);
  gameState = null;
  selectedMachine = null;
  render(true);
  void initializeLicense(() => render(false), isDemoPath());
}

function chooseContract(id: string): void {
  if (!gameState) return;
  gameState.selectedContractId = id;
  gameState.route = Array(CHAPTERS[gameState.chapterIndex]!.slots).fill(null);
  saveGame();
  render();
}

function startShift(): void {
  if (!gameState || validatePlan(gameState).length) return;
  gameState.status = 'running';
  gameState.remainingMs = SHIFT_MS;
  gameState.produced = 0;
  gameState.batchProgressMs = 0;
  gameState.attempts += 1;
  lastFrame = performance.now();
  playTone('start');
  saveGame();
  render();
}

function exportSave(): void {
  if (!gameState) return;
  const data = JSON.stringify({ product: 'finite-foundry', exportedAt: new Date().toISOString(), campaign: gameState }, null, 2);
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `finite-foundry-${gameState.seed}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function newCampaign(): void {
  const message = gameState?.completedChapters ? 'Replace this campaign with a new seed? Export first if you want a copy.' : 'Start this campaign again with a new seed?';
  if (!confirm(message)) return;
  gameState = createGame(isDemoPath() ? 240319 : Math.floor(Date.now() / 1000), isDemoPath());
  selectedMachine = null;
  saveGame();
  render();
}

function bindEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(link.pathname);
  }));
  document.querySelector('[data-action="start-real"]')?.addEventListener('click', (event) => {
    event.preventDefault();
    navigate('/play');
  });
  document.querySelector('[data-action="sound"]')?.addEventListener('click', () => {
    muted = !muted;
    try { localStorage.setItem(muteKey(), String(muted)); } catch { /* Sound still changes for this page view. */ }
    if (!muted) playTone('place');
    render();
  });
  document.querySelector('[data-action="reset-demo"]')?.addEventListener('click', () => {
    try { localStorage.removeItem('demo:finite-foundry:save'); } catch { /* Continue with fresh memory state. */ }
    gameState = createGame(240319, true);
    selectedMachine = null;
    saveGame();
    render();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-contract]').forEach((button) => button.addEventListener('click', () => chooseContract(button.dataset.contract!)));
  document.querySelectorAll<HTMLButtonElement>('[data-machine]').forEach((button) => button.addEventListener('click', () => {
    if (!gameState || gameState.status !== 'planning') return;
    selectedMachine = selectedMachine === button.dataset.machine ? null : button.dataset.machine as MachineId;
    playTone('place');
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-slot]').forEach((button) => button.addEventListener('click', () => {
    if (!gameState || gameState.status !== 'planning') return;
    const index = Number(button.dataset.slot);
    if (selectedMachine) {
      gameState.route = gameState.route.map((id) => id === selectedMachine ? null : id);
      gameState.route[index] = selectedMachine;
      selectedMachine = null;
      playTone('place');
    } else if (gameState.route[index]) {
      gameState.route[index] = null;
      playTone('remove');
    }
    saveGame();
    render();
  }));
  document.querySelectorAll<HTMLInputElement>('input[name="pace"]').forEach((radio) => radio.addEventListener('change', () => {
    if (!gameState) return;
    gameState.pace = radio.value as Pace;
    saveGame();
    render();
  }));
  document.querySelector('[data-action="clear-route"]')?.addEventListener('click', () => {
    if (!gameState) return;
    gameState.route = Array(gameState.route.length).fill(null);
    selectedMachine = null;
    saveGame();
    render();
  });
  document.querySelector('[data-action="change-contract"]')?.addEventListener('click', () => {
    if (!gameState) return;
    gameState.selectedContractId = null;
    gameState.route = Array(gameState.route.length).fill(null);
    saveGame();
    render();
  });
  document.querySelector('[data-action="start-shift"]')?.addEventListener('click', startShift);
  document.querySelector('[data-action="pause-shift"]')?.addEventListener('click', () => { if (gameState) { gameState.status = 'paused'; saveGame(); render(); } });
  document.querySelector('[data-action="resume-shift"]')?.addEventListener('click', () => { if (gameState) { gameState.status = 'running'; lastFrame = performance.now(); saveGame(); render(); } });
  document.querySelector('[data-action="retry-shift"]')?.addEventListener('click', () => {
    if (!gameState) return;
    gameState.status = 'planning'; gameState.remainingMs = SHIFT_MS; gameState.produced = 0; gameState.batchProgressMs = 0;
    saveGame(); render();
  });
  document.querySelector('[data-action="next-chapter"]')?.addEventListener('click', () => {
    if (!gameState) return;
    gameState = nextChapter(gameState); selectedMachine = null; saveGame(); playTone('win'); render();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-dismantle]').forEach((button) => button.addEventListener('click', () => {
    if (!gameState) return;
    gameState.route[Number(button.dataset.dismantle)] = null;
    playTone('remove'); saveGame(); render();
  }));
  document.querySelector('[data-action="finish-campaign"]')?.addEventListener('click', () => {
    if (!gameState) return;
    gameState.status = 'ending'; saveGame(); playTone('win'); render();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-bonus]').forEach((button) => button.addEventListener('click', () => {
    if (!gameState) return;
    const contract = BONUS_CONTRACTS[Number(button.dataset.bonus)];
    if (!contract || getLicenseStatus() !== 'unlocked') return;
    gameState.chapterIndex = contract.chapterIndex;
    gameState.selectedContractId = contract.id;
    gameState.bonusMode = true;
    gameState.bonusContract = contract;
    gameState.route = Array(CHAPTERS[contract.chapterIndex]!.slots).fill(null);
    gameState.pace = 'steady';
    gameState.status = 'planning';
    gameState.remainingMs = SHIFT_MS;
    gameState.produced = 0;
    gameState.batchProgressMs = 0;
    saveGame();
    render();
  }));
  document.querySelectorAll('[data-action="export-save"]').forEach((button) => button.addEventListener('click', exportSave));
  document.querySelectorAll('[data-action="new-campaign"]').forEach((button) => button.addEventListener('click', newCampaign));
  document.querySelector<HTMLFormElement>('[data-form="restore-license"]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const token = new FormData(form).get('license');
    const result = form.querySelector<HTMLElement>('.form-result')!;
    result.textContent = 'Checking this license…';
    const license = await restoreLicense(String(token ?? ''));
    result.textContent = license === 'unlocked' ? 'Bonus contracts are active on this device.' : license === 'inactive' ? 'That license is not active. Check the token and try again.' : 'The license service is unavailable. Try again when you are online.';
  });
}

function updateSimulationDisplay(): void {
  if (!gameState) return;
  const contract = selectedContract(gameState);
  const timer = document.querySelector<HTMLElement>('[data-timer]');
  const produced = document.querySelector<HTMLElement>('[data-produced]');
  const progress = document.querySelector<HTMLProgressElement>('[data-progress]');
  if (timer) timer.textContent = formatTime(gameState.remainingMs);
  if (produced) produced.textContent = String(Math.floor(gameState.produced));
  if (progress && contract) progress.value = Math.floor(gameState.produced);
}

function loop(now: number): void {
  const elapsed = Math.min(250, now - lastFrame);
  lastFrame = now;
  if (gameState?.status === 'running') {
    accumulator += elapsed;
    const scale = isTestClock() ? 600 : isDemoPath() ? 10 : 1;
    while (accumulator >= 100) {
      const before: string = gameState.status;
      gameState = stepSimulation(gameState, 100 * scale);
      accumulator -= 100;
      if (gameState.status !== before) {
        saveGame();
        playTone(gameState.status === 'won' ? 'win' : 'remove');
        render();
        break;
      }
    }
    if (now - lastDisplayUpdate > 200) {
      updateSimulationDisplay();
      lastDisplayUpdate = now;
    }
    if (now - lastSaveUpdate > 1000) {
      saveGame();
      lastSaveUpdate = now;
    }
  } else {
    accumulator = 0;
  }
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', (event) => {
  if (!gameState || gameState.status !== 'planning') return;
  const focusedSlot = (document.activeElement as HTMLElement | null)?.dataset.slot;
  if (focusedSlot !== undefined && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const nextIndex = Math.max(0, Math.min(gameState.route.length - 1, Number(focusedSlot) + direction));
    document.querySelector<HTMLButtonElement>(`[data-slot="${nextIndex}"]`)?.focus();
    return;
  }
  if (focusedSlot !== undefined && (event.key === 'Delete' || event.key === 'Backspace')) {
    event.preventDefault();
    gameState.route[Number(focusedSlot)] = null;
    saveGame();
    playTone('remove');
    render();
    return;
  }
  if (!selectedMachine) return;
  const index = Number(event.key) - 1;
  if (index >= 0 && index < gameState.route.length) {
    event.preventDefault();
    gameState.route = gameState.route.map((id) => id === selectedMachine ? null : id);
    gameState.route[index] = selectedMachine;
    selectedMachine = null;
    saveGame();
    render();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && gameState?.status === 'running') {
    gameState.status = 'paused';
    saveGame();
  } else if (!document.hidden && gameState?.status === 'paused' && (location.pathname === '/play' || location.pathname === '/demo')) {
    render();
  }
});

addEventListener('popstate', () => { gameState = null; selectedMachine = null; render(true); });
addEventListener('online', () => render(false));
addEventListener('offline', () => render(false));

loadMute();
render();
void initializeLicense(() => { if (location.pathname === '/' || location.pathname === '/play') render(false); }, isDemoPath());
requestAnimationFrame(loop);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
}
