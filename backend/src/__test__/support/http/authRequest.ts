import type { Express } from 'express'
import request from 'supertest'
import type { LoginRequest } from '@hatsuportal/contracts'
import type { LoginUserSeed } from '../fixtures/userFixture'

export type LoginCredentials = Pick<LoginRequest, 'username' | 'password'>
export type LoginInput = LoginCredentials | LoginUserSeed

export type ParsedAuthCookies = {
  cookieHeader: string
  token: string
  refreshToken: string
}

function parseSetCookieHeader(setCookieHeader: string): { name: string; value: string } | null {
  const [pair] = setCookieHeader.split(';')
  const separatorIndex = pair.indexOf('=')
  if (separatorIndex <= 0) {
    return null
  }

  return {
    name: pair.slice(0, separatorIndex).trim(),
    value: pair.slice(separatorIndex + 1).trim()
  }
}

export function parseSetCookieHeaders(setCookieHeaders: string | string[] | undefined): ParsedAuthCookies {
  const headers = setCookieHeaders ? (Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders]) : []
  const cookies: Record<string, string> = {}

  for (const header of headers) {
    const parsed = parseSetCookieHeader(header)
    if (parsed && parsed.value !== 'deleted') {
      cookies[parsed.name] = parsed.value
    }
  }

  const token = cookies.token
  const refreshToken = cookies.refreshToken

  if (!token || !refreshToken) {
    throw new Error('Expected token and refreshToken cookies in Set-Cookie response')
  }

  return {
    token,
    refreshToken,
    cookieHeader: `token=${token}; refreshToken=${refreshToken}`
  }
}

export async function loginAndGetCookies(app: Express, credentials: LoginInput): Promise<ParsedAuthCookies> {
  const response = await request(app).post('/api/v1/auth/login').send({
    username: credentials.username,
    password: credentials.password
  })

  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}: ${JSON.stringify(response.body)}`)
  }

  return parseSetCookieHeaders(response.headers['set-cookie'])
}
