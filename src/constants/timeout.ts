// src/constants/timeout.ts
export const TIMEOUT = {
  // Short timeouts for quick operations
  QUICK: 2000,

  // Standard timeouts
  DEFAULT: 5000,
  SHORT: 10000,

  // Medium timeouts for API responses
  MEDIUM: 15000,
  API: 30000,

  // Long timeouts for heavy operations
  LONG: 60000,
  BULK_OPERATIONS: 120000,

  // Very long for stress/load tests
  VERY_LONG: 300000,
} as const;

export const getTimeoutForOperation = (
  operationType: 'quick' | 'standard' | 'api' | 'bulk' | 'stress'
): number => {
  const timeouts: Record<string, number> = {
    quick: TIMEOUT.QUICK,
    standard: TIMEOUT.DEFAULT,
    api: TIMEOUT.API,
    bulk: TIMEOUT.BULK_OPERATIONS,
    stress: TIMEOUT.VERY_LONG,
  };
  return timeouts[operationType] || TIMEOUT.DEFAULT;
};
