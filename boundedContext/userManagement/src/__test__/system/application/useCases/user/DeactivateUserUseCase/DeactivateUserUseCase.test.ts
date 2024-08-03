import { describe, expect, it } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import { uuid } from '@hatsuportal/common'
import { UserId } from '../../../../../../domain'
import { UserEventTypes } from '../../../../../../domain/events/UserEvents'
import { systemWiring } from '../../../../../setup.system'

describe('DeactivateUserUseCase (system)', () => {
  async function seedActiveUser() {
    const creatorId = uuid()
    let userId = ''

    await systemWiring.createCreateUserUseCase().execute({
      createdById: creatorId,
      createUserInput: {
        name: 'Deactivate Target',
        email: `deactivate-${uuid().slice(0, 8)}@hatsuportal.test`,
        password: 'ValidPassword123',
        roles: []
      },
      userCreated: (user) => {
        userId = user.id
      }
    })

    return { creatorId, userId }
  }

  it('deactivates a persisted user', async () => {
    const { creatorId, userId } = await seedActiveUser()

    await systemWiring.createDeactivateUserUseCase().execute({
      deactivatingUserId: creatorId,
      deactivateUserInput: { userIdToDeactivate: userId },
      userDeactivated: (user) => {
        expect(user.active).toBe(false)
      }
    })

    const loaded = await systemWiring.userWriteRepository.findById(new UserId(userId))
    expect(loaded?.active).toBe(false)

    const outbox = await systemWiring.persistenceHarness.findOutboxEventsForAggregate(userId)
    expect(outbox.some((e) => e.eventType === UserEventTypes.UserDeactivated)).toBe(true)
  })

  it('throws NotFoundError when deactivating an already-inactive user', async () => {
    const { creatorId, userId } = await seedActiveUser()

    await systemWiring.createDeactivateUserUseCase().execute({
      deactivatingUserId: creatorId,
      deactivateUserInput: { userIdToDeactivate: userId },
      userDeactivated: () => undefined
    })

    const outboxCountAfterFirst = (await systemWiring.persistenceHarness.findOutboxEventsForAggregate(userId)).length

    expect(outboxCountAfterFirst).toBe(2)

    await expect(
      systemWiring.createDeactivateUserUseCase().execute({
        deactivatingUserId: creatorId,
        deactivateUserInput: { userIdToDeactivate: userId },
        userDeactivated: () => undefined
      })
    ).rejects.toBeInstanceOf(NotFoundError)

    const outboxCountAfterSecond = (await systemWiring.persistenceHarness.findOutboxEventsForAggregate(userId)).length

    expect(outboxCountAfterSecond).toBe(outboxCountAfterFirst)
  })

  it('throws NotFoundError when deactivating unknown user id', async () => {
    await expect(
      systemWiring.createDeactivateUserUseCase().execute({
        deactivatingUserId: uuid(),
        deactivateUserInput: { userIdToDeactivate: '00000000-0000-4000-8000-000000000099' },
        userDeactivated: () => undefined
      })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
