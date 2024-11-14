import { Hono } from 'hono'
import discord from './discord'
import github from './github'

export default new Hono().route('/github', github).route('/discord', discord)
