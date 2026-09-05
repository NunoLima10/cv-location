import { DB } from '@/db';
import {
  countries,
  islands,
  municipalities,
  parishes,
  places,
  zones,
} from '@/db/schemas';
import { errorResolver } from '@/utils/error-resolver';
import { sql, SQL } from 'drizzle-orm';

export type SearchResultRow = {
  id: number;
  name: string;
  code: string;
  level: number;
  type: 'country' | 'island' | 'municipality' | 'parish' | 'zone' | 'place';
  parentId: number | null;
  score: number;
};

/** One entry per location level, from largest (country) to smallest (place). */
const SEARCH_SOURCES = [
  { table: countries, type: 'country', parentId: sql`NULL::integer` },
  { table: islands, type: 'island', parentId: sql`${islands.countryId}` },
  {
    table: municipalities,
    type: 'municipality',
    parentId: sql`${municipalities.islandId}`,
  },
  { table: parishes, type: 'parish', parentId: sql`${parishes.municipalityId}` },
  { table: zones, type: 'zone', parentId: sql`${zones.parishId}` },
  { table: places, type: 'place', parentId: sql`${places.zoneId}` },
] as const;

/**
 * Builds `SELECT ... UNION ALL SELECT ...` over every location table.
 * `term` is the already-normalized (lower + unaccented) search string.
 * Each row is matched by substring OR trigram similarity (`pg_trgm`), and
 * scored by the stronger of `similarity` / `word_similarity`, with a bonus
 * for exact and prefix matches so those float to the top.
 */
function buildSearchUnion(term: SQL) {
  const score = sql`
    GREATEST(
      similarity(name_normalized, ${term}),
      word_similarity(${term}, name_normalized)
    )
    + CASE
        WHEN name_normalized = ${term} THEN 0.5
        WHEN starts_with(name_normalized, ${term}) THEN 0.25
        ELSE 0
      END`;

  return sql.join(
    SEARCH_SOURCES.map(
      (source) => sql`
        SELECT
          id, name, code, level,
          ${source.type}::text AS type,
          ${source.parentId} AS parent_id,
          ${score} AS score
        FROM ${source.table}
        WHERE name_normalized % ${term}
           OR position(${term} IN name_normalized) > 0`,
    ),
    sql` UNION ALL `,
  );
}

async function search(
  db: DB,
  q: string,
  limit: number,
  offset: number,
  level?: number,
) {
  const term = sql`(SELECT term FROM params)`;
  const union = buildSearchUnion(term);
  const levelFilter =
    level === undefined ? sql`` : sql`WHERE r.level = ${level}`;

  const [result, totals] = await Promise.all([
    db.execute<SearchResultRow>(sql`
      WITH params AS (SELECT immutable_unaccent(lower(${q})) AS term)
      SELECT r.id, r.name, r.code, r.level, r.type,
             r.parent_id AS "parentId", r.score
      FROM (${union}) AS r
      ${levelFilter}
      ORDER BY r.score DESC, r.name ASC
      LIMIT ${limit} OFFSET ${offset}
    `),
    db.execute<{ total: number }>(sql`
      WITH params AS (SELECT immutable_unaccent(lower(${q})) AS term)
      SELECT count(*)::integer AS total
      FROM (${union}) AS r
      ${levelFilter}
    `),
  ]);

  return { result, total: totals[0]?.total ?? 0 };
}

export const searchServices = {
  search: errorResolver(search, 'searchServices.search'),
};
