import {
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

export const genderEnum = pgEnum('gender', [
  'male',
  'female',
  'non_binary',
  'prefer_not_to_say'
])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 80 }).notNull(),
  gender: genderEnum('gender').notNull(),
  birthDate: date('birth_date', { mode: 'string' }).notNull(),
  sessionTokenHash: text('session_token_hash').notNull().unique(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string'
  }).defaultNow().notNull()
})

export type User = typeof users.$inferSelect
