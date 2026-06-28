/**
 * ResourceState — the universal shape for all HTTP-backed Signal stores.
 * Invariant: loading === true implies error === null.
 */
export interface ResourceState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

/**
 * Feature readiness level — controls the Data_Source_Strategy per module.
 * MOCK   : all data comes from the MockAdapter
 * PARTIAL: some APIs integrated, some still mocked
 * LIVE   : all APIs integrated, no mock data in production
 */
export type FeatureReadinessLevel = 'MOCK' | 'PARTIAL' | 'LIVE';

/**
 * Factory that produces a clean initial ResourceState with no data loaded.
 */
export function createInitialState<T>(): ResourceState<T> {
  return { loading: false, error: null, data: null };
}
