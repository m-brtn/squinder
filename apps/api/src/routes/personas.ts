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
import { desc, eq, inArray } from 'drizzle-orm'
import { type FastifyPluginAsync } from 'fastify'

import { personaInterests, personas, type Persona } from '../db/schema'
import { isValidBirthDate } from '../lib/dates'

interface PersonaBody {
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

interface PersonaParams {
  id: string
}

const UUID_PATTERN =
  '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'

const personaBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'birthDate', 'gender'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 80 },
    bio: { type: 'string', maxLength: 2000 },
    birthDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    gender: { type: 'string', enum: [...GENDERS] },
    interestedIn: { type: 'string', enum: [...INTERESTED_IN] },
    smoking: { type: 'string', enum: [...SMOKING] },
    alcohol: { type: 'string', enum: [...ALCOHOL] },
    workouts: { type: 'string', enum: [...WORKOUTS] },
    pets: { type: 'string', enum: [...PETS] },
    kids: { type: 'string', enum: [...KIDS] },
    country: { type: 'string', maxLength: 80 },
    city: { type: 'string', maxLength: 80 },
    photoUrls: {
      type: 'array',
      maxItems: 9,
      items: { type: 'string', minLength: 1, maxLength: 500 }
    },
    interests: {
      type: 'array',
      maxItems: MAX_PROFILE_INTERESTS,
      uniqueItems: true,
      items: { type: 'string', minLength: 1, maxLength: 80 }
    }
  }
} as const

const personaParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', pattern: UUID_PATTERN }
  }
} as const

type PersonaWithInterests = Persona & { interests: string[] }

const withInterests = (
  rows: Persona[],
  interestsByPersona: Map<string, string[]>
): PersonaWithInterests[] =>
  rows.map((row) => ({
    ...row,
    interests: interestsByPersona.get(row.id) ?? []
  }))

const toPersonaValues = (body: PersonaBody) => ({
  name: body.name.trim(),
  bio: body.bio?.trim() ?? '',
  birthDate: body.birthDate,
  gender: body.gender,
  interestedIn: body.interestedIn ?? 'everyone',
  smoking: body.smoking ?? 'no',
  alcohol: body.alcohol ?? 'no',
  workouts: body.workouts ?? 'no',
  pets: body.pets ?? 'no',
  kids: body.kids ?? 'no',
  country: body.country?.trim() ?? '',
  city: body.city?.trim() ?? '',
  photoUrls: body.photoUrls ?? []
})

const personaRoutes: FastifyPluginAsync = async (fastify) => {
  const loadInterests = async (
    personaIds: string[]
  ): Promise<Map<string, string[]>> => {
    const result = new Map<string, string[]>()
    if (personaIds.length === 0) return result

    const links = await fastify.db
      .select()
      .from(personaInterests)
      .where(inArray(personaInterests.personaId, personaIds))

    for (const link of links) {
      const slugs = result.get(link.personaId) ?? []
      slugs.push(link.interestSlug)
      result.set(link.personaId, slugs)
    }

    return result
  }

  const findInvalidInterests = (slugs: string[]): string[] =>
    slugs.filter((slug) => !isInterestSlug(slug))

  fastify.get('/personas', async () => {
    const rows = await fastify.db
      .select()
      .from(personas)
      .orderBy(desc(personas.createdAt))
    const interestsByPersona = await loadInterests(
      rows.map((row) => row.id)
    )

    return { personas: withInterests(rows, interestsByPersona) }
  })

  fastify.get<{ Params: PersonaParams }>('/personas/:id', {
    schema: { params: personaParamsSchema }
  }, async (request, reply) => {
    const [row] = await fastify.db
      .select()
      .from(personas)
      .where(eq(personas.id, request.params.id))
      .limit(1)

    if (row == null) {
      return await reply.notFound('Persona not found')
    }

    const interestsByPersona = await loadInterests([row.id])
    return { persona: withInterests([row], interestsByPersona)[0] }
  })

  fastify.post<{ Body: PersonaBody }>('/personas', {
    schema: { body: personaBodySchema }
  }, async (request, reply) => {
    if (!isValidBirthDate(request.body.birthDate)) {
      return await reply.badRequest('Invalid birth date')
    }

    const interestSlugs = request.body.interests ?? []
    const invalid = findInvalidInterests(interestSlugs)
    if (invalid.length > 0) {
      return await reply.badRequest(
        `Unknown interests: ${invalid.join(', ')}`
      )
    }

    const persona = await fastify.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(personas)
        .values(toPersonaValues(request.body))
        .returning()

      if (interestSlugs.length > 0) {
        await tx.insert(personaInterests).values(
          interestSlugs.map((slug) => ({
            personaId: row.id,
            interestSlug: slug
          }))
        )
      }

      return row
    })

    return reply
      .code(201)
      .send({ persona: { ...persona, interests: interestSlugs } })
  })

  fastify.put<{ Body: PersonaBody; Params: PersonaParams }>(
    '/personas/:id',
    {
      schema: { body: personaBodySchema, params: personaParamsSchema }
    },
    async (request, reply) => {
      if (!isValidBirthDate(request.body.birthDate)) {
        return await reply.badRequest('Invalid birth date')
      }

      const interestSlugs = request.body.interests ?? []
      const invalid = findInvalidInterests(interestSlugs)
      if (invalid.length > 0) {
        return await reply.badRequest(
          `Unknown interests: ${invalid.join(', ')}`
        )
      }

      const persona = await fastify.db.transaction(async (tx) => {
        const [row] = await tx
          .update(personas)
          .set({
            ...toPersonaValues(request.body),
            updatedAt: new Date().toISOString()
          })
          .where(eq(personas.id, request.params.id))
          .returning()

        if (row == null) return null

        await tx
          .delete(personaInterests)
          .where(eq(personaInterests.personaId, row.id))
        if (interestSlugs.length > 0) {
          await tx.insert(personaInterests).values(
            interestSlugs.map((slug) => ({
              personaId: row.id,
              interestSlug: slug
            }))
          )
        }

        return row
      })

      if (persona == null) {
        return await reply.notFound('Persona not found')
      }

      return { persona: { ...persona, interests: interestSlugs } }
    }
  )

  fastify.delete<{ Params: PersonaParams }>('/personas/:id', {
    schema: { params: personaParamsSchema }
  }, async (request, reply) => {
    const deleted = await fastify.db
      .delete(personas)
      .where(eq(personas.id, request.params.id))
      .returning({ id: personas.id })

    if (deleted.length === 0) {
      return await reply.notFound('Persona not found')
    }

    return reply.code(204).send()
  })
}

export default personaRoutes
