import 'reflect-metadata'
import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import { DependencyContainer } from 'tsyringe'
import { createErrorMiddleware } from '../../../infrastructure/middlewares/errorMiddleware'
import { IAuthentication } from '../../../infrastructure/auth/IAuthentication'
import { IHttpErrorMapper } from '@hatsuportal/platform'

export async function createTestApp(container: DependencyContainer): Promise<express.Express> {
  const app = express()

  app.use(urlencoded({ extended: true }))
  app.use(json({ limit: '50mb' }))
  app.use(cookieParser())
  app.use(container.resolve<IAuthentication>('IAuthentication').initialize())

  const { RegisterRoutes } = await import('../../../routes.js')
  RegisterRoutes(app)

  app.use(createErrorMiddleware(container.resolve<IHttpErrorMapper>('IHttpErrorMapper')))

  return app
}
