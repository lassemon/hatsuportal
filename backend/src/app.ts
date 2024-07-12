import express, { json, urlencoded } from 'express'
import { RegisterRoutes } from './routes'
import Authentication from './auth/Authentication'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import { errorMiddleware } from './common/middlewares/errorMiddleware'

const app = express()
const authentication = new Authentication(passport)

// Use body parser to read sent json payloads
app.use(urlencoded({ extended: true }))
app.use(json({ limit: '50mb' }))
// CookieParser Middleware
app.use(cookieParser())
app.use(authentication.initialize())

RegisterRoutes(app)

app.use(errorMiddleware)

export default app
