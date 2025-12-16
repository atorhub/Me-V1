import { isValidAdapterResult } from './adapter.contract.js';

export function guardAdapterResult(result) {
  if (!isValidAdapterResult(result)) {
    return Object.freeze({
      ok: false,
      error: 'INVALID_ADAPTER_RESULT',
      value: null
    });
  }

  if (result.confidence < 0.3) {
    return Object.freeze({
      ok: false,
      error: 'LOW_CONFIDENCE',
      value: null
    });
  }

  return Object.freeze({
    ok: true,
    value: result
  });
}
