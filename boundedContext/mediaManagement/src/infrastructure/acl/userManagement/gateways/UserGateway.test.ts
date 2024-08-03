import { describe, expect, it, vi } from 'vitest'
import { userV1 } from '@hatsuportal/bounded-context-service-contracts'
import { UserRoleEnum } from '@hatsuportal/common'
import { ApplicationError } from '@hatsuportal/platform'
import { UserGateway } from './UserGateway'
import { UserGatewayMapper } from '../mappers/UserGatewayMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('UserGateway', () => {
  const setup = () => {
    const userQueryFacade: userV1.IUserQueryFacade = {
      getUserById: vi.fn()
    }
    const userGatewayMapper = new UserGatewayMapper()
    const gateway = new UserGateway(userQueryFacade, userGatewayMapper)
    return { userQueryFacade, gateway }
  }

  const userContract = (): userV1.UserContract => ({
    id: Fixture.sampleUserId,
    name: 'Test User',
    email: 'test.user@example.com',
    roles: [UserRoleEnum.Admin],
    active: true,
    createdAt: 1,
    updatedAt: 2
  })

  it('maps successful facade result to user read model', async () => {
    const { userQueryFacade, gateway } = setup()
    vi.mocked(userQueryFacade.getUserById).mockResolvedValue(userContract())

    const result = await gateway.getUserById({ userId: Fixture.sampleUserId })

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({
      id: Fixture.sampleUserId,
      name: 'Test User',
      email: 'test.user@example.com',
      roles: [UserRoleEnum.Admin],
      active: true,
      createdAt: 1,
      updatedAt: 2
    })
  })

  it('returns failed load when facade throws an Error', async () => {
    const { userQueryFacade, gateway } = setup()
    vi.mocked(userQueryFacade.getUserById).mockRejectedValue(new Error('boom'))

    const result = await gateway.getUserById({ userId: Fixture.sampleUserId })

    expect(result.isFailed()).toBe(true)
    expect(result.error.error.message).toBe('boom')
  })

  it('wraps non-Error throws in ApplicationError', async () => {
    const { userQueryFacade, gateway } = setup()
    vi.mocked(userQueryFacade.getUserById).mockRejectedValue('not-an-error')

    const result = await gateway.getUserById({ userId: Fixture.sampleUserId })

    expect(result.isFailed()).toBe(true)
    expect(result.error.error).toBeInstanceOf(ApplicationError)
    expect(result.error.error.message).toBe('Unknown error occurred')
  })
})
