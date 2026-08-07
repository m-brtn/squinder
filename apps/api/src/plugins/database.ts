import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import fp from 'fastify-plugin'
import postgres, { type Sql } from 'postgres'

declare module 'fastify' {
  interface FastifyInstance {
    db: PostgresJsDatabase
  }
}

export default fp(
  async (fastify) => {
    const client: Sql = postgres(fastify.config.DATABASE_URL, {
      max: 10,
      prepare: false
    })

    fastify.decorate('db', drizzle(client))
    fastify.addHook('onClose', async () => {
      await client.end()
    })
  },
  {
    name: 'database',
    dependencies: ['env']
  }
)
