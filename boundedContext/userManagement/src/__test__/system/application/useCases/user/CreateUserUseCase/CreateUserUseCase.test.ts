import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { UserId } from '../../../../../../domain'
import { UserEventTypes } from '../../../../../../domain/events/UserEvents'
import { systemWiring } from '../../../../../setup.system'
import { DataPersistenceError } from '@hatsuportal/platform'

describe('CreateUserUseCase (system)', () => {
  it('creates a user and persists domain event to outbox', async () => {
    const userId = uuid()
    const email = `create-${userId.slice(0, 8)}@hatsuportal.test`
    let createdId = ''

    await systemWiring.createCreateUserUseCase().execute({
      createdById: userId,
      createUserInput: {
        name: 'System Test User',
        email,
        password: 'ValidPassword123',
        roles: []
      },
      userCreated: (user) => {
        createdId = user.id
      }
    })

    expect(createdId).toBeTruthy()
    const loaded = await systemWiring.userWriteRepository.findById(new UserId(createdId))
    expect(loaded).not.toBeNull()

    const outbox = await systemWiring.persistenceHarness.findOutboxEventsForAggregate(createdId)
    expect(outbox.some((e) => e.eventType === UserEventTypes.UserCreated)).toBe(true)
  })

  it('rolls back when email already exists', async () => {
    const email = `duplicate-${uuid().slice(0, 8)}@hatsuportal.test`
    const creatorId = uuid()
    let firstUserId = ''

    await systemWiring.createCreateUserUseCase().execute({
      createdById: creatorId,
      createUserInput: {
        name: 'First User',
        email,
        password: 'ValidPassword123',
        roles: []
      },
      userCreated: (user) => {
        firstUserId = user.id
      }
    })

    const usersBefore = await systemWiring.userReadRepository.findAll()
    const outboxCountBefore = await systemWiring.persistenceHarness.dataAccessProvider
      .table('domain_event_outbox')
      .count('* as count')
      .then((rows) => Number(rows[0].count))

    await expect(
      systemWiring.createCreateUserUseCase().execute({
        createdById: creatorId,
        createUserInput: {
          name: 'Second User',
          email,
          password: 'ValidPassword123',
          roles: []
        },
        userCreated: () => undefined
      })
    ).rejects.toThrow(DataPersistenceError)

    const usersAfter = await systemWiring.userReadRepository.findAll()
    expect(usersAfter).toHaveLength(usersBefore.length)

    const outboxForFirstUser = await systemWiring.persistenceHarness.findOutboxEventsForAggregate(firstUserId)
    expect(outboxForFirstUser.filter((e) => e.eventType === UserEventTypes.UserCreated)).toHaveLength(1)

    const outboxCountAfter = await systemWiring.persistenceHarness.dataAccessProvider
      .table('domain_event_outbox')
      .count('* as count')
      .then((rows) => Number(rows[0].count))
    expect(outboxCountAfter).toBe(outboxCountBefore)
  })
})
