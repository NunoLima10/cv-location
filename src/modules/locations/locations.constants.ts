/**
 * Row counts per location level, produced by `pnpm seeds:count`. The seed set is
 * static, so `/v1/locations/stats` serves these constants rather than running six
 * `COUNT(*)` queries on every request. Regenerate and paste the output here
 * whenever the seed files change.
 */
export const LOCATION_STATS = {
  countries: 1,
  islands: 9,
  municipalities: 22,
  parishes: 32,
  zones: 441,
  places: 3535,
} as const;

export const LOCATION_STATS_TOTAL = Object.values(LOCATION_STATS).reduce(
  (sum, n) => sum + n,
  0,
);
