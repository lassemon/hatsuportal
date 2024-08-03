import { describe, expect, it } from 'vitest'
import { AuthenticationError } from '@hatsuportal/platform'
import { uuid } from '@hatsuportal/common'
import { systemWiring } from '../../../../../setup.system'

function normalizeNameAsEmail(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '').toLowerCase() + '@hatsuportal.test'
}

describe('LoginUserUseCase (system)', () => {
  async function seedUser(name: string, password: string) {
    const creatorId = uuid()
    await systemWiring.createCreateUserUseCase().execute({
      createdById: creatorId,
      createUserInput: {
        name,
        email: normalizeNameAsEmail(name),
        password,
        roles: []
      },
      userCreated: () => undefined
    })
    return { name, password }
  }

  it('logs in with correct password and returns stub tokens', async () => {
    const name = `loginuser${uuid().slice(0, 8)}`
    const { password } = await seedUser(name, 'ValidPassword123')

    let authToken = ''
    let refreshToken = ''
    await systemWiring.createLoginUserUseCase().execute({
      loginUserInput: { username: name, password },
      loginSuccess: (token, refresh, user) => {
        authToken = token
        refreshToken = refresh
        expect(user.name).toBe(name)
      }
    })

    expect(authToken).toBe('test-auth-token')
    expect(refreshToken).toBe('test-refresh-token')
  })

  it('rejects incorrect password', async () => {
    const name = `loginwrong${uuid().slice(0, 8)}`
    await seedUser(name, 'ValidPassword123')

    await expect(
      systemWiring.createLoginUserUseCase().execute({
        loginUserInput: { username: name, password: 'WrongPassword123' },
        loginSuccess: () => undefined
      })
    ).rejects.toBeInstanceOf(AuthenticationError)
  })

  it('rejects inactive user', async () => {
    const creatorId = uuid()
    const name = `logininactive${uuid().slice(0, 8)}`
    let userId = ''

    await systemWiring.createCreateUserUseCase().execute({
      createdById: creatorId,
      createUserInput: {
        name,
        email: normalizeNameAsEmail(name),
        password: 'ValidPassword123',
        roles: []
      },
      userCreated: (user) => {
        userId = user.id
      }
    })

    await systemWiring.createDeactivateUserUseCase().execute({
      deactivatingUserId: creatorId,
      deactivateUserInput: { userIdToDeactivate: userId },
      userDeactivated: () => undefined
    })

    await expect(
      systemWiring.createLoginUserUseCase().execute({
        loginUserInput: { username: name, password: 'ValidPassword123' },
        loginSuccess: () => undefined
      })
    ).rejects.toBeInstanceOf(AuthenticationError)
  })
})
