import env, { type FastifyEnvOptions } from '@fastify/env'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string
    }
  }
}

const options: FastifyEnvOptions = {
  confKey: 'config',
  dotenv: true,
  schema: {
    type: 'object',
    required: ['DATABASE_URL'],
    properties: {
      DATABASE_URL: {
        type: 'string'
      }
    }
  }
}

export default fp(
  async (fastify) => {
    await fastify.register(env, options)
  },
  { name: 'env' }
)
