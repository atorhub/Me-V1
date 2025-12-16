import { arbitrate } from './core.arbiter.js';
import { CORE_ERRORS } from './core.errors.js';

export function runCore(adapterResults = []) {
  try {
    if (!Array.isArray(adapterResults)) {
      return Object.freeze({
        status: 'INVALID_INPUT',
        truth: null,
        error: CORE_ERRORS.INVALID_ADAPTER_RESULT
      });
    }

    return arbitrate(adapterResults);
  } catch (e) {
    return Object.freeze({
      status: 'INTERNAL_ERROR',
      truth: null,
      error: CORE_ERRORS.INTERNAL_ERROR
    });
  }
}
