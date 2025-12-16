import { guardAdapterResult } from './core.guard.js';

export function arbitrate(adapterResults = []) {
  const valid = [];

  for (const result of adapterResults) {
    const guarded = guardAdapterResult(result);
    if (guarded.ok) valid.push(guarded.value);
  }

  if (valid.length === 0) {
    return Object.freeze({
      status: 'NO_VALID_INTELLIGENCE',
      truth: null
    });
  }

  valid.sort((a, b) => b.confidence - a.confidence);

  const winner = valid[0];

  return Object.freeze({
    status: 'TRUTH_SELECTED',
    truth: Object.freeze({
      source: winner.source,
      proposal: winner.proposal,
      confidence: winner.confidence,
      timestamp: winner.timestamp
    }),
    considered: valid.length
  });
}
