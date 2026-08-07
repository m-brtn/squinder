import * as assert from 'node:assert'
import { test } from 'node:test'
import { build } from '../helper'

test('health route exposes the backend version', async (t) => {
  const app = await build(t)
  const response = await app.inject({ url: '/health' })
  const payload = JSON.parse(response.payload)

  assert.equal(response.statusCode, 200)
  assert.equal(payload.status, 'ok')
  assert.equal(payload.version, '0.1.0')
  assert.ok(Date.parse(payload.timestamp))
})
