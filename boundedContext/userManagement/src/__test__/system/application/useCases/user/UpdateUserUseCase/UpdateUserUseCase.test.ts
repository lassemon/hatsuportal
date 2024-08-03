import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { UserEventTypes } from '../../../../../../domain/events/UserEvents'
import { systemWiring } from '../../../../../setup.system'
import { NotFoundError } from '@hatsuportal/platform'

describe('UpdateUserUseCase (system)', () => {
  async function seedUser() {
    const creatorId = uuid()
    let userId = ''
    const email = `update-${uuid().slice(0, 8)}@hatsuportal.test`

    await systemWiring.createCreateUserUseCase().execute({
      createdById: creatorId,
      createUserInput: {
        name: 'Update Target',
        email,
        password: 'ValidPassword123',
        roles: []
      },
      userCreated: (user) => {
        userId = user.id
      }
    })
    return { userId, creatorId }
  }

  it('updates user email and password via UserAuthenticationService', async () => {
    const { userId, creatorId } = await seedUser()
    const newEmail = `updated-${uuid().slice(0, 8)}@hatsuportal.test`

    await systemWiring.createUpdateUserUseCase().execute({
      updatedById: creatorId,
      updateUserInput: {
        id: userId,
        email: newEmail,
        newPassword: 'NewValidPassword123',
        oldPassword: 'ValidPassword123'
      },
      userUpdated: (user) => {
        expect(user.email).toBe(newEmail)
      },
      updateConflict: () => {
        throw new Error('unexpected conflict')
      }
    })

    const outbox = await systemWiring.persistenceHarness.findOutboxEventsForAggregate(userId)
    expect(outbox.some((e) => e.eventType === UserEventTypes.UserUpdated)).toBe(true)
  })

  it('updates user name without password change', async () => {
    const { userId, creatorId } = await seedUser()

    await systemWiring.createUpdateUserUseCase().execute({
      updatedById: creatorId,
      updateUserInput: { id: userId, name: 'Renamed User' },
      userUpdated: (user) => {
        expect(user.name).toBe('Renamed User')
      },
      updateConflict: () => {
        throw new Error('unexpected conflict')
      }
    })
  })

  it('does not add duplicate outbox events when setting active true on already-active user twice', async () => {
    const { userId, creatorId } = await seedUser()

    const outboxCountAfterCreate = (await systemWiring.persistenceHarness.findOutboxEventsForAggregate(userId)).length

    expect(outboxCountAfterCreate).toBe(1)

    const activeTrueUpdate = async () =>
      systemWiring.createUpdateUserUseCase().execute({
        updatedById: creatorId,
        updateUserInput: { id: userId, active: true },
        userUpdated: () => undefined,
        updateConflict: () => {
          throw new Error('unexpected conflict')
        }
      })

    await activeTrueUpdate()
    await activeTrueUpdate()

    const outboxCountAfterUpdates = (await systemWiring.persistenceHarness.findOutboxEventsForAggregate(userId)).length

    expect(outboxCountAfterUpdates).toBe(1)
  })

  it('throws NotFoundError when updating an inactive user', async () => {
    const { userId, creatorId } = await seedUser()

    await systemWiring.createDeactivateUserUseCase().execute({
      deactivatingUserId: creatorId,
      deactivateUserInput: { userIdToDeactivate: userId },
      userDeactivated: () => undefined
    })

    await expect(
      systemWiring.createUpdateUserUseCase().execute({
        updatedById: creatorId,
        updateUserInput: { id: userId, name: 'Should Fail' },
        userUpdated: () => undefined,
        updateConflict: () => undefined
      })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
