import { createHash, randomBytes } from 'node:crypto'

import { eq } from 'drizzle-orm'
import { type FastifyPluginAsync } from 'fastify'

import { users } from '../db/schema'

type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say'
type LookingFor = 'male' | 'female' | 'everyone'

interface CreateUserBody {
  name: string
  gender: Gender
  lookingFor: LookingFor
  birthDate: string
}

const genders: Gender[] = [
  'male',
  'female',
  'non_binary',
  'prefer_not_to_say'
]
const lookingForOptions: LookingFor[] = ['male', 'female', 'everyone']

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex')

const isValidBirthDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    date <= new Date()
}

const userSelection = {
  id: users.id,
  name: users.name,
  gender: users.gender,
  lookingFor: users.lookingFor,
  birthDate: users.birthDate,
  createdAt: users.createdAt
}

const userRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: CreateUserBody }>('/users', {
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'gender', 'lookingFor', 'birthDate'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 80 },
          gender: { type: 'string', enum: genders },
          lookingFor: { type: 'string', enum: lookingForOptions },
          birthDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }
        }
      }
    }
  }, async (request, reply) => {
    const name = request.body.name.trim()
    if (name.length < 2 || !isValidBirthDate(request.body.birthDate)) {
      return await reply.badRequest('Invalid name or birth date')
    }

    const sessionToken = randomBytes(32).toString('hex')
    const [user] = await fastify.db
      .insert(users)
      .values({
        name,
        gender: request.body.gender,
        lookingFor: request.body.lookingFor,
        birthDate: request.body.birthDate,
        sessionTokenHash: hashToken(sessionToken)
      })
      .returning(userSelection)

    return reply.code(201).send({ user, sessionToken })
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

    return { user }
  })
}

export default userRoutes
