import { RequestHandler } from 'express'

export interface IAuthentication {
  authenticationMiddleware(): RequestHandler
  passThroughAuthenticationMiddleware(): RequestHandler
  initialize(): RequestHandler
}
