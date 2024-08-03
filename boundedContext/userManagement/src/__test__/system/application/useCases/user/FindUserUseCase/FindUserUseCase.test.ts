import { describe, expect, it } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import { uuid } from '@hatsuportal/common'
import { systemWiring } from '../../../../../setup.system'

describe('FindUserUseCase (system)', () => {
  it('finds a persisted active user', async () => {
    const creatorId = uuid()
    let userId = ''
    const email = `find-${uuid().slice(0, 8)}@hatsuportal.test`

    await systemWiring.createCreateUserUseCase().execute({
      createdById: creatorId,
      createUserInput: {
        name: 'Find Target',
        email,
        password: 'ValidPassword123',
        roles: []
      },
      userCreated: (user) => {
        userId = user.id
      }
    })

    let foundEmail = ''
    await systemWiring.createFindUserUseCase().execute({
      loggedInUserId: creatorId,
      findUserInput: { userIdToFind: userId },
      userFound: (user) => {
        foundEmail = user.email
      }
    })

    expect(foundEmail).toBe(email)
  })

  it('throws NotFoundError for unknown user id', async () => {
    await expect(
      systemWiring.createFindUserUseCase().execute({
        loggedInUserId: uuid(),
        findUserInput: { userIdToFind: '00000000-0000-4000-8000-000000000099' },
        userFound: () => undefined
      })
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('finds inactive user when row exists', async () => {
    const creatorId = uuid()
    let userId = ''
    const email = `find-inactive-${uuid().slice(0, 8)}@hatsuportal.test`

    await systemWiring.createCreateUserUseCase().execute({
      createdById: creatorId,
      createUserInput: { name: 'Find Target', email, password: 'ValidPassword123', roles: [] },
      userCreated: (user) => {
        userId = user.id
      }
    })

    await systemWiring.createDeactivateUserUseCase().execute({
      deactivatingUserId: creatorId,
      deactivateUserInput: { userIdToDeactivate: userId },
      userDeactivated: () => undefined
    })

    let foundActive = true
    await systemWiring.createFindUserUseCase().execute({
      loggedInUserId: creatorId,
      findUserInput: { userIdToFind: userId },
      userFound: (user) => {
        foundActive = user.active
      }
    })

    expect(foundActive).toBe(false)
  })
})
