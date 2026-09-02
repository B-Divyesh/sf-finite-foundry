import { expect, test } from '@playwright/test';
import { CHAPTERS, contractsForChapter, createGame, forecastOutput, selectedContract, stepSimulation, validatePlan } from '../src/core';

test('@claim:deterministic-contracts seeded contracts stay deterministic and vary by seed', () => {
  expect(contractsForChapter(42, 0)).toEqual(contractsForChapter(42, 0));
  expect(contractsForChapter(42, 0)).not.toEqual(contractsForChapter(43, 0));
  expect(contractsForChapter(42, 0)).toHaveLength(3);
});

test('@claim:simulation-step equivalent 100ms steps produce the same deterministic result', () => {
  const contract = [...contractsForChapter(42, 0)].sort((a, b) => a.quota - b.quota)[0]!;
  const makeRunning = () => {
    const state = createGame(42);
    state.selectedContractId = contract.id;
    state.route = ['cutter', 'press', null];
    state.status = 'running' as const;
    return state;
  };
  let stepped = makeRunning();
  for (let elapsed = 0; elapsed < 12_000; elapsed += 100) stepped = stepSimulation(stepped, 100);
  const single = stepSimulation(makeRunning(), 12_000);
  expect(stepped.remainingMs).toBe(single.remainingMs);
  expect(stepped.produced).toBe(single.produced);
  expect(stepped.batchProgressMs).toBe(single.batchProgressMs);
});

test('a valid route produces the forecast and wins', () => {
  let state = createGame(42);
  const contract = [...contractsForChapter(42, 0)].sort((a, b) => a.quota - b.quota)[0]!;
  state.selectedContractId = contract.id;
  state.route = ['cutter', 'press', null];
  state.status = 'running';
  expect(validatePlan(state)).toEqual([]);
  expect(forecastOutput(state)).toBe(25);
  state = stepSimulation(state, 300_000);
  expect(Math.floor(state.produced)).toBe(25);
  expect(state.status).toBe('won');
  expect(selectedContract(state)?.client).toBe(contract.client);
});

test('every chapter rejects a route that omits its recipe', () => {
  for (let chapterIndex = 0; chapterIndex < CHAPTERS.length; chapterIndex += 1) {
    const state = createGame(42);
    state.chapterIndex = chapterIndex;
    state.route = Array(CHAPTERS[chapterIndex]!.slots).fill(null);
    expect(validatePlan(state).length).toBeGreaterThan(0);
  }
});
