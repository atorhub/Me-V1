/*
ME CORE — ADAPTER CONTRACT
All intelligence layers must obey this contract.
No adapter may mutate truth directly.
*/

export function createAdapterResult({
  source,
  proposal,
  confidence = 0,
  notes = ''
}) {
  return Object.freeze({
    source,
    proposal,
    confidence,
    notes,
    timestamp: Date.now()
  });
}

export function isValidAdapterResult(result) {
  return (
    result !== null &&
    typeof result === 'object' &&
    typeof result.source === 'string' &&
    result.source.length > 0 &&
    result.proposal !== undefined &&
    typeof result.confidence === 'number' &&
    result.confidence >= 0 &&
    result.confidence <= 1
  );
    }
