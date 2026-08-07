import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import fp from 'fastify-plugin'

export default fp(
  async (fastify) => {
    await fastify.register(cors, { origin: true })
    await fastify.register(websocket)
  },
  { name: 'realtime' }
)
