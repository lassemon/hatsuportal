import { describe, expect, it } from 'vitest'
import { userV1 } from '@hatsuportal/bounded-context-service-contracts'
import { UserRoleEnum } from '@hatsuportal/common'
import { UserGatewayMapper } from './UserGatewayMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('UserGatewayMapper', () => {
  const mapper = new UserGatewayMapper()

  it('maps user contract to read model DTO', () => {
    const contract: userV1.UserContract = {
      id: Fixture.sampleUserId,
      name: 'Test User',
      email: 'test.user@example.com',
      roles: [UserRoleEnum.Admin],
      active: true,
      createdAt: 1,
      updatedAt: 2
    }

    expect(mapper.toUserReadModelDTO(contract)).toEqual({
      id: Fixture.sampleUserId,
      name: 'Test User',
      email: 'test.user@example.com',
      roles: [UserRoleEnum.Admin],
      active: true,
      createdAt: 1,
      updatedAt: 2
    })
  })
})
