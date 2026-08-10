import {
  ALCOHOL,
  GENDERS,
  INTERESTED_IN,
  KIDS,
  PETS,
  SMOKING,
  WORKOUTS
} from '@squinder/shared'
import {
  date,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

export const genderEnum = pgEnum('gender', GENDERS)

export const lookingForEnum = pgEnum('looking_for', INTERESTED_IN)

export const smokingEnum = pgEnum('smoking', SMOKING)

export const alcoholEnum = pgEnum('alcohol', ALCOHOL)

export const workoutsEnum = pgEnum('workouts', WORKOUTS)

export const petsEnum = pgEnum('pets', PETS)

export const kidsEnum = pgEnum('kids', KIDS)

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 80 }).notNull(),
  gender: genderEnum('gender').notNull(),
  lookingFor: lookingForEnum('looking_for').default('everyone').notNull(),
  birthDate: date('birth_date', { mode: 'string' }).notNull(),
  sessionTokenHash: text('session_token_hash').notNull().unique(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string'
  }).defaultNow().notNull()
})

export const personas = pgTable('personas', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Stable identifier used by seed files to upsert idempotently. */
  seedKey: text('seed_key').unique(),
  name: varchar('name', { length: 80 }).notNull(),
  bio: text('bio').default('').notNull(),
  birthDate: date('birth_date', { mode: 'string' }).notNull(),
  gender: genderEnum('gender').notNull(),
  interestedIn: lookingForEnum('interested_in')
    .default('everyone')
    .notNull(),
  smoking: smokingEnum('smoking').default('no').notNull(),
  alcohol: alcoholEnum('alcohol').default('no').notNull(),
  workouts: workoutsEnum('workouts').default('no').notNull(),
  pets: petsEnum('pets').default('no').notNull(),
  kids: kidsEnum('kids').default('no').notNull(),
  country: varchar('country', { length: 80 }).default('').notNull(),
  city: varchar('city', { length: 80 }).default('').notNull(),
  photoUrls: text('photo_urls')
    .array()
    .default([])
    .notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string'
  }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string'
  }).defaultNow().notNull()
})

export const interests = pgTable('interests', {
  slug: text('slug').primaryKey(),
  category: text('category').notNull(),
  label: text('label').notNull()
})

export const personaInterests = pgTable(
  'persona_interests',
  {
    personaId: uuid('persona_id')
      .notNull()
      .references(() => personas.id, { onDelete: 'cascade' }),
    interestSlug: text('interest_slug')
      .notNull()
      .references(() => interests.slug, { onDelete: 'cascade' })
  },
  (table) => [
    primaryKey({ columns: [table.personaId, table.interestSlug] })
  ]
)

export const userInterests = pgTable(
  'user_interests',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    interestSlug: text('interest_slug')
      .notNull()
      .references(() => interests.slug, { onDelete: 'cascade' })
  },
  (table) => [primaryKey({ columns: [table.userId, table.interestSlug] })]
)

export type User = typeof users.$inferSelect
export type Persona = typeof personas.$inferSelect
export type Interest = typeof interests.$inferSelect
