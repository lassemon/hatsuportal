import type { Express } from 'express'
import request, { type Test } from 'supertest'

export type AuthenticatedClient = {
  get: (url: string) => Test
  post: (url: string) => Test
  patch: (url: string) => Test
  delete: (url: string) => Test
}

export function createAuthenticatedClient(app: Express, cookieHeader: string): AuthenticatedClient {
  const withCookie = (req: Test) => req.set('Cookie', cookieHeader)

  return {
    get: (url) => withCookie(request(app).get(url)),
    post: (url) => withCookie(request(app).post(url)),
    patch: (url) => withCookie(request(app).patch(url)),
    delete: (url) => withCookie(request(app).delete(url))
  }
}

export function createAuthenticatedClientFromTokens(
  app: Express,
  tokens: { token: string; refreshToken: string }
): AuthenticatedClient {
  return createAuthenticatedClient(app, `token=${tokens.token}; refreshToken=${tokens.refreshToken}`)
}
