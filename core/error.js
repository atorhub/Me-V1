export const CORE_ERRORS = Object.freeze({
  INVALID_ADAPTER_RESULT: 'Adapter result failed validation',
  LOW_CONFIDENCE: 'Confidence below acceptable threshold',
  NO_VALID_INTELLIGENCE: 'No valid intelligence available',
  INTERNAL_ERROR: 'Unexpected core failure'
});

export function explainError(code) {
  return CORE_ERRORS[code] || 'Unknown error';
}
