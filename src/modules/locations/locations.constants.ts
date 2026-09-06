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

/**
 * Public-code length for each hierarchy level (index 0 → level 1 country … index
 * 5 → level 6 place). Every level's code is a prefix of the level below, so a
 * code's length alone identifies its level, and slicing these lengths off the
 * front yields every ancestor code without a single join. See the data model in
 * the README.
 */
export const CODE_LENGTH_BY_LEVEL = [2, 3, 5, 8, 13, 20] as const;
