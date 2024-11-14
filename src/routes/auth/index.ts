import { Hono } from 'hono'
import discord from './discord'
import github from './github'
import login from './login'
import signIn from './sign-in'

export default new Hono()
  .route('/github', github)
  .route('/discord', discord)
  .route('/login', login)
  .route('/sign-in', signIn)
