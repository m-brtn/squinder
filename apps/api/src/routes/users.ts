import { createHash, randomBytes } from 'node:crypto'

import {
  GENDERS,
  INTERESTED_IN,
  MAX_PROFILE_INTERESTS,
  isInterestSlug,
  type Gender,
  type LookingFor
} from '@squinder/shared'
import { eq } from 'drizzle-orm'
import { type FastifyPluginAsync } from 'fastify'

import { userInterests, users } from '../db/schema'
import { isValidBirthDate } from '../lib/dates'

interface CreateUserBody {
  name: string
  gender: Gender
  lookingFor: LookingFor
  birthDate: string
  interests?: string[]
}

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex')

const userSelection = {
  id: users.id,
  name: users.name,
  gender: users.gender,
  lookingFor: users.lookingFor,
  birthDate: users.birthDate,
  createdAt: users.createdAt
}

const userRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  const loadUserInterests = async (userId: string): Promise<string[]> => {
    const links = await fastify.db
      .select({ interestSlug: userInterests.interestSlug })
      .from(userInterests)
      .where(eq(userInterests.userId, userId))

    return links.map((link) => link.interestSlug)
  }

  fastify.post<{ Body: CreateUserBody }>('/users', {
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'gender', 'lookingFor', 'birthDate'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 80 },
          gender: { type: 'string', enum: [...GENDERS] },
          lookingFor: { type: 'string', enum: [...INTERESTED_IN] },
          birthDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          interests: {
            type: 'array',
            maxItems: MAX_PROFILE_INTERESTS,
            uniqueItems: true,
            items: { type: 'string', minLength: 1, maxLength: 80 }
          }
        }
      }
    }
  }, async (request, reply) => {
    const name = request.body.name.trim()
    if (name.length < 2 || !isValidBirthDate(request.body.birthDate)) {
      return await reply.badRequest('Invalid name or birth date')
    }

    const interests = request.body.interests ?? []
    const invalid = interests.filter((slug) => !isInterestSlug(slug))
    if (invalid.length > 0) {
      return await reply.badRequest(
        `Unknown interests: ${invalid.join(', ')}`
      )
    }

    const sessionToken = randomBytes(32).toString('hex')
    const user = await fastify.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(users)
        .values({
          name,
          gender: request.body.gender,
          lookingFor: request.body.lookingFor,
          birthDate: request.body.birthDate,
          sessionTokenHash: hashToken(sessionToken)
        })
        .returning(userSelection)

      if (interests.length > 0) {
        await tx.insert(userInterests).values(
          interests.map((slug) => ({
            userId: row.id,
            interestSlug: slug
          }))
        )
      }

      return row
    })

    return reply
      .code(201)
      .send({ user: { ...user, interests }, sessionToken })
  })

  fastify.get('/me', async (request, reply) => {
    const authorization = request.headers.authorization
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : null

    if (token == null || token.length === 0) {
      return await reply.unauthorized('Missing session token')
    }

    const [user] = await fastify.db
      .select(userSelection)
      .from(users)
      .where(eq(users.sessionTokenHash, hashToken(token)))
      .limit(1)

    if (user == null) {
      return await reply.unauthorized('Invalid session token')
    }

    const interests = await loadUserInterests(user.id)
    return { user: { ...user, interests } }
  })
}

export default userRoutes
