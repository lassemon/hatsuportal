import { InputLimits } from '@hatsuportal/contracts'
import { describe, it, vi, expect, afterEach } from 'vitest'
import { InvalidInputError } from '@hatsuportal/platform'
import { UpdateUserProfileUseCaseWithValidation } from './UpdateUserProfileUseCaseWithValidation'
import { IUserReadRepository } from '../../../read/IUserReadRepository'
import * as Fixture from '../../../../__test__/testFactory'

describe('UpdateUserProfileUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createWrapped = () => {
    const useCaseMock = { execute: vi.fn().mockResolvedValue(undefined) }
    const user = Fixture.userMock()
    const userReadRepository = {
      findById: vi.fn().mockResolvedValue(Fixture.userReadModelFromUser(user))
    } as unknown as IUserReadRepository
    const authorizationService = Fixture.userAuthorizationServiceMock()

    const wrapped = new UpdateUserProfileUseCaseWithValidation(useCaseMock, userReadRepository, authorizationService)

    return { wrapped, useCaseMock, user }
  }

  it('delegates to inner use case when bio and statusMessage are valid', async () => {
    const { wrapped, useCaseMock, user } = createWrapped()

    await wrapped.execute({
      updatedById: user.id.value,
      userId: user.id.value,
      updateUserProfileInput: {
        bio: 'A short bio.',
        statusMessage: 'Online'
      },
      userProfileUpdated: vi.fn(),
      updateConflict: vi.fn()
    })

    expect(useCaseMock.execute).toHaveBeenCalledTimes(1)
  })

  it('throws InvalidInputError when bio exceeds limit', async () => {
    const { wrapped, useCaseMock, user } = createWrapped()

    await expect(
      wrapped.execute({
        updatedById: user.id.value,
        userId: user.id.value,
        updateUserProfileInput: {
          bio: 'x'.repeat(InputLimits.bio + 1)
        },
        userProfileUpdated: vi.fn(),
        updateConflict: vi.fn()
      })
    ).rejects.toThrow(InvalidInputError)

    expect(useCaseMock.execute).not.toHaveBeenCalled()
  })

  it('throws InvalidInputError when statusMessage exceeds limit', async () => {
    const { wrapped, useCaseMock, user } = createWrapped()

    await expect(
      wrapped.execute({
        updatedById: user.id.value,
        userId: user.id.value,
        updateUserProfileInput: {
          statusMessage: 'x'.repeat(InputLimits.statusMessage + 1)
        },
        userProfileUpdated: vi.fn(),
        updateConflict: vi.fn()
      })
    ).rejects.toThrow(InvalidInputError)

    expect(useCaseMock.execute).not.toHaveBeenCalled()
  })
})
