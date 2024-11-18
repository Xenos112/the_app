import { Hono } from 'hono'
import auth from './auth'
import me from './me'
import post from './post'
import user from './user'

export default new Hono()
  .route('/auth', auth)
  .route('/me', me)
  .route('/post', post)
  .route('/user', user)
