import { describe, expect, it } from 'vitest'
import {
  AuthenticationError,
  AuthorizationError,
  ConcurrencyError,
  InvalidInputError,
  NotFoundError
} from '@hatsuportal/platform'
import { HttpErrorMapper } from './HttpErrorMapper'

describe('HttpErrorMapper', () => {
  const mapper = new HttpErrorMapper()

  it('maps NotFoundError to 404', () => {
    const result = mapper.mapApplicationErrorToHttpError(new NotFoundError('missing'))

    expect(result).toEqual({
      status: 404,
      name: 'NotFound',
      message: 'missing'
    })
  })

  it('maps AuthenticationError to 401', () => {
    const result = mapper.mapApplicationErrorToHttpError(new AuthenticationError('Unauthorized'))

    expect(result).toEqual({
      status: 401,
      name: 'Unauthorized',
      message: 'Unauthorized'
    })
  })

  it('maps AuthorizationError to 403', () => {
    const result = mapper.mapApplicationErrorToHttpError(new AuthorizationError('Forbidden'))

    expect(result).toEqual({
      status: 403,
      name: 'Forbidden',
      message: 'Forbidden'
    })
  })

  it('maps ConcurrencyError to 409', () => {
    const result = mapper.mapApplicationErrorToHttpError(new ConcurrencyError('Conflict'))

    expect(result).toEqual({
      status: 409,
      name: 'Conflict',
      message: 'Conflict'
    })
  })

  it('maps InvalidInputError to 422', () => {
    const result = mapper.mapApplicationErrorToHttpError(new InvalidInputError('Invalid input'))

    expect(result).toEqual({
      status: 422,
      name: 'UnprocessableContent',
      message: 'Invalid input'
    })
  })

  it('maps unknown errors to 500', () => {
    const result = mapper.mapApplicationErrorToHttpError(new Error('boom'))

    expect(result).toEqual({
      status: 500,
      name: 'InternalServerError'
    })
  })
})
