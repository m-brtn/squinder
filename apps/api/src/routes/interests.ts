import {
  INTEREST_CATEGORIES,
  MAX_PROFILE_INTERESTS
} from '@squinder/shared'
import { type FastifyPluginAsync } from 'fastify'

const interestRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/interests', async () => ({
    categories: INTEREST_CATEGORIES,
    maxSelected: MAX_PROFILE_INTERESTS
  }))
}

export default interestRoutes
