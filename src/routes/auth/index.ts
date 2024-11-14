import { Hono } from 'hono'
import login from '../login'
import discord from './discord'
import github from './github'

export default new Hono()
  .route('/github', github)
  .route('/discord', discord)
  .route('/login', login)
