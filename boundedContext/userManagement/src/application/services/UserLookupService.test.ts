import { describe, expect, it } from 'vitest'
import { UserId } from '../../domain'
import { UserLookupService } from './UserLookupService'
import * as Fixture from '../../__test__/testFactory'

describe('UserLookupService', () => {
  const setup = () => {
    const userReadRepository = Fixture.userReadRepositoryMock()
    const service = new UserLookupService(userReadRepository)
    return { userReadRepository, service }
  }

  it('delegates invalidateById to the read repository', () => {
    const { userReadRepository, service } = setup()
    const userId = new UserId(Fixture.sampleUserId)

    service.invalidateById(userId)

    expect(userReadRepository.invalidateById).toHaveBeenCalledWith(userId)
  })
})
