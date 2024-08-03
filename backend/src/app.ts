import 'reflect-metadata'
import express, { json, urlencoded } from 'express'
import cors from 'cors'

import { configureContainer } from './container'
const container = configureContainer()
import { RegisterRoutes } from './routes'
import cookieParser from 'cookie-parser'
import { errorMiddleware } from './infrastructure/middlewares/errorMiddleware'
import { Authentication } from 'infrastructure/auth/Authentication'

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
app.use(container.resolve<Authentication>('Authentication').initialize())

RegisterRoutes(app)

app.use(errorMiddleware)

export default app
