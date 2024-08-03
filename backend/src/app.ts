import 'reflect-metadata' // allows decorators for TSOA like @Get, @Route etc. and injections with tsyringe like @injectable()
import express, { json, urlencoded } from 'express'
import path from 'path'

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
app.use(cookieParser())
app.use(tsyringeContainer.resolve<IAuthentication>('IAuthentication').initialize())

// Serve compiled React SPA — __dirname is backend/build/ at runtime, so ../../frontend/build resolves to frontend/build/
app.use(express.static(path.join(__dirname, '../../frontend/build')))

initializeCronJobs(tsyringeContainer.resolveAll<ICronJob>('ICronJob'))

RegisterRoutes(app)

// Catch-all: return the SPA shell for any route not handled by the API.
// Must be after RegisterRoutes so API routes take priority.
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'))
})

app.use(createErrorMiddleware(tsyringeContainer.resolve<IHttpErrorMapper>('IHttpErrorMapper')))

export default app
