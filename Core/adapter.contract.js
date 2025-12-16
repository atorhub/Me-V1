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
    result &&
    Object.isFrozen(result) &&
    typeof result.source === 'string' &&
    result.source.length > 0 &&
    'proposal' in result &&
    typeof result.confidence === 'number' &&
    Number.isFinite(result.confidence) &&
    result.confidence >= 0 &&
    result.confidence <= 1 &&
    typeof result.timestamp === 'number'
  );
}
