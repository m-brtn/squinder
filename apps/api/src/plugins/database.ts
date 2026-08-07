import { join } from 'node:path'

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import fp from 'fastify-plugin'
import postgres from 'postgres'

import * as schema from '../db/schema'

declare module 'fastify' {
  interface FastifyInstance {
    db: PostgresJsDatabase<typeof schema>
  }
}

export default fp(
  async (fastify) => {
    const client = postgres(fastify.config.DATABASE_URL, {
      max: 10,
      prepare: false
    })
    const db = drizzle(client, { schema })

    if (process.env.NODE_ENV !== 'test') {
      await migrate(db, {
        migrationsFolder: join(__dirname, '../../drizzle')
      })
    }

    fastify.decorate('db', db)
    fastify.addHook('onClose', async () => {
      await client.end()
    })
  },
  {
    name: 'database',
    dependencies: ['env']
  }
)
