import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Counts the rows in every seed file so the numbers can be baked into
 * `LOCATION_STATS` (src/modules/locations/locations.constants.ts). The seed set
 * is static, so the `/v1/locations/stats` route serves these constants instead
 * of hitting the database. Re-run with `pnpm seeds:count` whenever seeds change.
 */
const SEED_DIR = join(__dirname, '../db/seeds/data');

const FILES = {
  countries: 'countries.json',
  islands: 'islands.json',
  municipalities: 'municipality.json',
  parishes: 'parish.json',
  zones: 'zones.json',
  places: 'places.json',
} as const;

function countSeeds() {
  const counts = Object.fromEntries(
    Object.entries(FILES).map(([key, file]) => {
      const rows = JSON.parse(
        readFileSync(join(SEED_DIR, file), 'utf-8'),
      ) as unknown[];
      return [key, rows.length];
    }),
  ) as Record<keyof typeof FILES, number>;

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  process.stdout.write(`${JSON.stringify({ total, ...counts }, null, 2)}\n`);
}

countSeeds();
