import { type FastifyPluginAsync } from 'fastify'

const realtime: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/ws', { websocket: true }, (socket) => {
    const sendPing = (): void => {
      if (socket.readyState === 1) {
        socket.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        }))
      }
    }

    sendPing()
    const timer = setInterval(sendPing, 5_000)
    const clearTimer = (): void => clearInterval(timer)

    socket.once('close', clearTimer)
    socket.once('error', clearTimer)
  })

  fastify.get('/events', async (request, reply) => {
    reply.hijack()
    reply.raw.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream'
    })
    reply.raw.write(`event: connected\ndata: ${JSON.stringify({
      timestamp: new Date().toISOString()
    })}\n\n`)

    const timer = setInterval(() => {
      reply.raw.write(`event: ping\ndata: ${JSON.stringify({
        timestamp: new Date().toISOString()
      })}\n\n`)
    }, 15_000)

    request.raw.once('close', () => clearInterval(timer))
  })
}

export default realtime
