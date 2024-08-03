import { describe, expect, it, vi } from 'vitest'
import type { IHttpErrorMapper } from '@hatsuportal/platform'
import { NotFoundError } from '@hatsuportal/platform'
import type { NextFunction, Request, Response } from 'express'
import { ValidateError } from 'tsoa'
import { createErrorMiddleware } from './errorMiddleware'

describe('errorMiddleware', () => {
  const mapper: IHttpErrorMapper = {
    mapApplicationErrorToHttpError: vi.fn().mockReturnValue({
      status: 404,
      name: 'NotFound',
      message: 'missing'
    })
  }

  it('maps ValidateError to the TSOA validation response shape', () => {
    const middleware = createErrorMiddleware(mapper)
    const json = vi.fn()
    const status = vi.fn().mockReturnValue({ json })
    const response = { status } as unknown as Response
    const request = { path: '/api/v1/auth/login' } as Request
    const next = vi.fn() as NextFunction

    middleware(
      new ValidateError(
        { username: { message: 'required' } },
        'Validation failed'
      ),
      request,
      response,
      next
    )

    expect(status).toHaveBeenCalledWith(422)
    expect(json).toHaveBeenCalledWith({
      message: 'Validation Failed',
      details: { username: { message: 'required' } }
    })
    expect(mapper.mapApplicationErrorToHttpError).not.toHaveBeenCalled()
  })

  it('delegates non-ValidateError errors to the mapper', () => {
    const middleware = createErrorMiddleware(mapper)
    const json = vi.fn()
    const status = vi.fn().mockReturnValue({ json })
    const response = { status } as unknown as Response
    const request = { path: '/api/v1/users' } as Request
    const next = vi.fn() as NextFunction
    const error = new NotFoundError('missing')

    middleware(error, request, response, next)

    expect(mapper.mapApplicationErrorToHttpError).toHaveBeenCalledWith(error)
    expect(status).toHaveBeenCalledWith(404)
    expect(json).toHaveBeenCalledWith({
      status: 404,
      name: 'NotFound',
      message: 'missing'
    })
  })
})
