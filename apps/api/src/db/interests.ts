import { ALL_INTERESTS, INTEREST_CATEGORY_BY_SLUG } from '@squinder/shared'
import { sql } from 'drizzle-orm'
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import * as schema from './schema'

/** Upserts the shared interest matrix into the interests table. */
export const syncInterests = async (
  db: PostgresJsDatabase<typeof schema>
): Promise<void> => {
  const rows = ALL_INTERESTS.map((item) => ({
    slug: item.slug,
    category: INTEREST_CATEGORY_BY_SLUG.get(item.slug) ?? 'other',
    label: item.label
  }))

  await db
    .insert(schema.interests)
    .values(rows)
    .onConflictDoUpdate({
      target: schema.interests.slug,
      set: {
        category: sql`excluded.category`,
        label: sql`excluded.label`
      }
    })
}
