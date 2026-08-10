import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

import {
  ALCOHOL,
  GENDERS,
  INTERESTED_IN,
  KIDS,
  MAX_PROFILE_INTERESTS,
  PETS,
  SMOKING,
  WORKOUTS,
  isInterestSlug,
  type Alcohol,
  type Gender,
  type InterestedIn,
  type Kids,
  type Pets,
  type Smoking,
  type Workouts
} from '@squinder/shared'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { syncInterests } from '../db/interests'
import * as schema from '../db/schema'
import { isValidBirthDate } from '../lib/dates'

interface SeedPersona {
  key: string
  name: string
  bio?: string
  birthDate: string
  gender: Gender
  interestedIn?: InterestedIn
  smoking?: Smoking
  alcohol?: Alcohol
  workouts?: Workouts
  pets?: Pets
  kids?: Kids
  country?: string
  city?: string
  photoUrls?: string[]
  interests?: string[]
}

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgres://squinder:squinder@localhost:7135/squinder'

const DEFAULT_SEEDS_DIR = join(__dirname, '..', '..', 'seeds')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value != null && !Array.isArray(value)

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const oneOf = <T extends string>(
  allowed: readonly T[],
  value: unknown
): value is T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value)

const collectSeedFiles = (target: string): string[] => {
  const stats = statSync(target)
  if (stats.isFile()) return [target]

  return readdirSync(target)
    .filter((entry) => entry.endsWith('.json'))
    .sort()
    .map((entry) => join(target, entry))
}

const validatePersona = (
  raw: unknown,
  context: string,
  errors: string[]
): SeedPersona | null => {
  if (!isRecord(raw)) {
    errors.push(`${context}: persona must be an object`)
    return null
  }

  const fail = (message: string): null => {
    errors.push(`${context}: ${message}`)
    return null
  }

  if (typeof raw.key !== 'string' || raw.key.trim().length === 0) {
    return fail('"key" is required (stable unique string for upserts)')
  }
  if (typeof raw.name !== 'string' || raw.name.trim().length < 2) {
    return fail('"name" is required (min 2 characters)')
  }
  if (
    typeof raw.birthDate !== 'string' ||
    !isValidBirthDate(raw.birthDate)
  ) {
    return fail('"birthDate" must be a valid YYYY-MM-DD date in the past')
  }
  if (!oneOf(GENDERS, raw.gender)) {
    return fail(`"gender" must be one of: ${GENDERS.join(', ')}`)
  }
  if (raw.interestedIn != null && !oneOf(INTERESTED_IN, raw.interestedIn)) {
    return fail(`"interestedIn" must be one of: ${INTERESTED_IN.join(', ')}`)
  }
  if (raw.smoking != null && !oneOf(SMOKING, raw.smoking)) {
    return fail(`"smoking" must be one of: ${SMOKING.join(', ')}`)
  }
  if (raw.alcohol != null && !oneOf(ALCOHOL, raw.alcohol)) {
    return fail(`"alcohol" must be one of: ${ALCOHOL.join(', ')}`)
  }
  if (raw.workouts != null && !oneOf(WORKOUTS, raw.workouts)) {
    return fail(`"workouts" must be one of: ${WORKOUTS.join(', ')}`)
  }
  if (raw.pets != null && !oneOf(PETS, raw.pets)) {
    return fail(`"pets" must be one of: ${PETS.join(', ')}`)
  }
  if (raw.kids != null && !oneOf(KIDS, raw.kids)) {
    return fail(`"kids" must be one of: ${KIDS.join(', ')}`)
  }
  if (raw.bio != null && typeof raw.bio !== 'string') {
    return fail('"bio" must be a string')
  }
  if (raw.country != null && typeof raw.country !== 'string') {
    return fail('"country" must be a string')
  }
  if (raw.city != null && typeof raw.city !== 'string') {
    return fail('"city" must be a string')
  }
  if (raw.photoUrls != null && !isStringArray(raw.photoUrls)) {
    return fail('"photoUrls" must be an array of strings')
  }
  if (raw.interests != null) {
    if (!isStringArray(raw.interests)) {
      return fail('"interests" must be an array of interest slugs')
    }
    if (raw.interests.length > MAX_PROFILE_INTERESTS) {
      return fail(`"interests" allows at most ${MAX_PROFILE_INTERESTS} items`)
    }
    const unknown = raw.interests.filter((slug) => !isInterestSlug(slug))
    if (unknown.length > 0) {
      return fail(
        `"interests" contains unknown slugs: ${unknown.join(', ')}. ` +
          'See packages/shared/src/interests.ts for the full list'
      )
    }
  }

  return raw as unknown as SeedPersona
}

const parseSeedFile = (file: string, errors: string[]): SeedPersona[] => {
  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    errors.push(`${file}: invalid JSON (${(error as Error).message})`)
    return []
  }

  const items = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.personas)
      ? parsed.personas
      : null

  if (items == null) {
    errors.push(
      `${file}: expected an array of personas or { "personas": [...] }`
    )
    return []
  }

  return items
    .map((item, index) =>
      validatePersona(item, `${file} #${index + 1}`, errors)
    )
    .filter((item): item is SeedPersona => item != null)
}

const main = async (): Promise<void> => {
  const target = resolve(process.argv[2] ?? DEFAULT_SEEDS_DIR)
  const files = collectSeedFiles(target)

  if (files.length === 0) {
    console.error(`No .json seed files found in ${target}`)
    process.exitCode = 1
    return
  }

  const errors: string[] = []
  const personas = files.flatMap((file) => parseSeedFile(file, errors))

  const keys = new Set<string>()
  for (const persona of personas) {
    if (keys.has(persona.key)) {
      errors.push(`Duplicate persona key: "${persona.key}"`)
    }
    keys.add(persona.key)
  }

  if (errors.length > 0) {
    console.error('Seed validation failed:')
    for (const error of errors) console.error(`  - ${error}`)
    process.exitCode = 1
    return
  }

  const client = postgres(DATABASE_URL, { max: 1, prepare: false })
  const db = drizzle(client, { schema })

  try {
    await syncInterests(db)

    let created = 0
    let updated = 0

    for (const persona of personas) {
      const values = {
        seedKey: persona.key,
        name: persona.name.trim(),
        bio: persona.bio?.trim() ?? '',
        birthDate: persona.birthDate,
        gender: persona.gender,
        interestedIn: persona.interestedIn ?? 'everyone',
        smoking: persona.smoking ?? 'no',
        alcohol: persona.alcohol ?? 'no',
        workouts: persona.workouts ?? 'no',
        pets: persona.pets ?? 'no',
        kids: persona.kids ?? 'no',
        country: persona.country?.trim() ?? '',
        city: persona.city?.trim() ?? '',
        photoUrls: persona.photoUrls ?? []
      }

      const inserted = await db
        .insert(schema.personas)
        .values(values)
        .onConflictDoUpdate({
          target: schema.personas.seedKey,
          set: { ...values, updatedAt: new Date().toISOString() }
        })
        .returning({
          id: schema.personas.id,
          createdAt: schema.personas.createdAt,
          updatedAt: schema.personas.updatedAt
        })

      const row = inserted[0]
      if (row.createdAt === row.updatedAt) created += 1
      else updated += 1

      await db
        .delete(schema.personaInterests)
        .where(eq(schema.personaInterests.personaId, row.id))
      const interestSlugs = persona.interests ?? []
      if (interestSlugs.length > 0) {
        await db.insert(schema.personaInterests).values(
          interestSlugs.map((slug) => ({
            personaId: row.id,
            interestSlug: slug
          }))
        )
      }
    }

    console.log(
      `Seeded ${personas.length} personas from ${files.length} file(s): ` +
        `${created} created, ${updated} updated`
    )
  } finally {
    await client.end()
  }
}

void main()
