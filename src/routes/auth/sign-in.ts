import { Hono } from 'hono'

export default new Hono().post('/', (c) => {
  return c.text('Sign in')
})
