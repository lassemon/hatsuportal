import { describe, expect, it } from 'vitest'
import { UserApiMapper } from './UserApiMapper'
import _ from 'lodash'

describe('UserApiMapper', () => {
  const userMapper = new UserApiMapper()
  it('converts create request to create input dto', ({ unitFixture }) => {
    const createRequest = unitFixture.createUserRequest()
    const dto = userMapper.toCreateUserInputDTO(createRequest, unitFixture.sampleUserId)

    expect((dto as any).id).toBeUndefined() // should not be given from request
    expect(dto.name).toBe(createRequest.name)
    expect(dto.email).toBe(createRequest.email)
    expect(dto.password).toBe(createRequest.password)
    expect(dto.roles).toStrictEqual(createRequest.roles)
    expect((dto as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto as any).updatedAt).toBeUndefined() // should not be given from request
  })

  it('converts update request to update input dto', ({ unitFixture }) => {
    const updateRequest = unitFixture.updateUserRequest()
    const dto = userMapper.toUpdateUserInputDTO(updateRequest, unitFixture.sampleUserId, 'logged-in-user-id')

    expect(dto.id).toBeTypeOf('string')
    expect(dto.id).toBe(unitFixture.sampleUserId)
    expect(dto.name).toBe(updateRequest.name)
    expect((dto as any).password).toBeUndefined() // should not be given from request
    expect((dto as any).oldPassword).toBe(updateRequest.oldPassword)
    expect((dto as any).newPassword).toBe(updateRequest.newPassword)
    expect(dto.email).toBe(updateRequest.email)
    expect(dto.roles).toStrictEqual(updateRequest.roles)
    expect(dto.active).toBe(false)
    expect((dto as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto as any).updatedAt).toBeUndefined() // should not be given from request
  })

  it('converts user dto to response', ({ unitFixture }) => {
    expect(userMapper.toResponse(unitFixture.userDTOMock())).toStrictEqual(_.omit(unitFixture.userDTOMock(), 'active'))
  })
})
