import 'reflect-metadata'
import express, { json, urlencoded } from 'express'
import cors from 'cors'

import { init } from './compositionRoot'
const tsyringeContainer = init()
import { RegisterRoutes } from './routes'
import cookieParser from 'cookie-parser'
import { createErrorMiddleware } from './infrastructure/middlewares/errorMiddleware'
import { IAuthentication } from './infrastructure/auth/IAuthentication'
import { initializeCronJobs } from './cronJobs'
import { ICronJob, IHttpErrorMapper } from '@hatsuportal/platform'

const app = express()

// Use body parser to read sent json payloads
app.use(urlencoded({ extended: true }))
app.use(json({ limit: '50mb' }))
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
app.use(cookieParser())
app.use(tsyringeContainer.resolve<IAuthentication>('IAuthentication').initialize())

initializeCronJobs(tsyringeContainer.resolveAll<ICronJob>('ICronJob'))

RegisterRoutes(app)

app.use(createErrorMiddleware(tsyringeContainer.resolve<IHttpErrorMapper>('IHttpErrorMapper')))

export default app
