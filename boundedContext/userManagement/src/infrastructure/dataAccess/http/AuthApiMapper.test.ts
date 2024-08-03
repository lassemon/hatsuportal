import { describe, expect, it } from 'vitest'
import { InvalidRequestError } from '@hatsuportal/platform'
import { AuthApiMapper } from './AuthApiMapper'

describe('AuthApiMapper', () => {
  const mapper = new AuthApiMapper()

  it('converts login request to login input dto', () => {
    expect(
      mapper.toLoginUserInputDTO({
        username: 'alice',
        password: 'secret'
      })
    ).toStrictEqual({
      username: 'alice',
      password: 'secret'
    })
  })

  it('throws when username is missing', () => {
    expect(() => mapper.toLoginUserInputDTO({ username: '', password: 'secret' })).toThrow(InvalidRequestError)
    expect(() => mapper.toLoginUserInputDTO({ username: '', password: 'secret' })).toThrow(
      'Missing required post parameter "username"'
    )
  })

  it('throws when password is missing', () => {
    expect(() => mapper.toLoginUserInputDTO({ username: 'alice', password: '' })).toThrow(InvalidRequestError)
    expect(() => mapper.toLoginUserInputDTO({ username: 'alice', password: '' })).toThrow(
      'Missing required post parameter "password"'
    )
  })
})
