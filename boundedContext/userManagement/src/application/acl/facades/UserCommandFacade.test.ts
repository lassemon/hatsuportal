import { describe, expect, it, vi } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import { UserCommandFacade } from './UserCommandFacade'
import { UserCommandMapper } from './mappers/UserCommandMapper'
import * as Fixture from '../../../__test__/testFactory'

describe('UserCommandFacade', () => {
  const createMockUseCases = () => {
    const createUserUseCase = { execute: vi.fn() }
    const updateUserUseCase = { execute: vi.fn() }
    const deactivateUserUseCase = { execute: vi.fn() }
    const userCommandMapper = new UserCommandMapper()
    const facade = new UserCommandFacade(createUserUseCase, updateUserUseCase, deactivateUserUseCase, userCommandMapper)
    return { createUserUseCase, updateUserUseCase, deactivateUserUseCase, facade }
  }

  it('resolves createUser via success callback', async () => {
    const { createUserUseCase, facade } = createMockUseCases()
    createUserUseCase.execute.mockImplementation(async (input) => {
      input.userCreated(Fixture.userDTOMock())
    })

    await expect(
      facade.createUser({
        createdById: Fixture.sampleUserId,
        name: 'alice',
        email: 'alice@example.com',
        password: 'Password123!',
        roles: [UserRoleEnum.Viewer]
      })
    ).resolves.toStrictEqual({ userId: Fixture.sampleUserId })
  })

  it('propagates createUser use case rejection', async () => {
    const { createUserUseCase, facade } = createMockUseCases()
    createUserUseCase.execute.mockRejectedValue(new Error('create failed'))

    await expect(
      facade.createUser({
        createdById: Fixture.sampleUserId,
        name: 'alice',
        email: 'alice@example.com',
        password: 'Password123!',
        roles: [UserRoleEnum.Viewer]
      })
    ).rejects.toThrow('create failed')
  })

  it('resolves updateUser via success callback', async () => {
    const { updateUserUseCase, facade } = createMockUseCases()
    updateUserUseCase.execute.mockImplementation(async (input) => {
      input.userUpdated(Fixture.userDTOMock())
    })

    await expect(
      facade.updateUser({
        updatedById: Fixture.sampleUserId,
        id: Fixture.sampleUserId,
        name: 'alice',
        email: 'alice@example.com',
        roles: [UserRoleEnum.Viewer],
        active: true
      })
    ).resolves.toStrictEqual({ userId: Fixture.sampleUserId })
  })

  it('rejects updateUser on updateConflict callback', async () => {
    const { updateUserUseCase, facade } = createMockUseCases()
    updateUserUseCase.execute.mockImplementation(async (input) => {
      input.updateConflict(Fixture.userDTOMock())
    })

    await expect(
      facade.updateUser({
        updatedById: Fixture.sampleUserId,
        id: Fixture.sampleUserId,
        name: 'alice',
        email: 'alice@example.com',
        roles: [UserRoleEnum.Viewer],
        active: true
      })
    ).rejects.toThrow('User already exists')
  })

  it('resolves deactivateUser via success callback', async () => {
    const { deactivateUserUseCase, facade } = createMockUseCases()
    deactivateUserUseCase.execute.mockImplementation(async (input) => {
      input.userDeactivated(Fixture.userDTOMock())
    })

    await expect(
      facade.deactivateUser({
        requestedById: Fixture.sampleUserId,
        id: Fixture.sampleUserId
      })
    ).resolves.toStrictEqual({ userId: Fixture.sampleUserId })
  })
})
