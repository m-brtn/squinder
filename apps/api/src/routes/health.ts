import { type FastifyPluginAsync } from 'fastify'

const { version } = require('../../package.json') as { version: string }

const health: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/health', async () => ({
    status: 'ok' as const,
    version,
    timestamp: new Date().toISOString()
  }))
}

export default health
