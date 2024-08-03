import { describe, expect, it } from 'vitest'
import { UserApiMapper } from './UserApiMapper'
import _ from 'lodash'

describe('UserApiMapper', () => {
  const userMapper = new UserApiMapper()
  it('converts create request to create input dto', ({ unitFixture }) => {
    const createRequest = unitFixture.createUserRequest()
    const dto = userMapper.toCreateUserInputDTO(createRequest, unitFixture.userDTOMock().id)

    expect((dto.creationData as any).id).toBeUndefined() // should not be given from request
    expect(dto.loggedInUserId).toBe(unitFixture.userDTOMock().id)
    expect(dto.creationData.name).toBe(createRequest.name)
    expect(dto.creationData.email).toBe(createRequest.email)
    expect(dto.creationData.password).toBe(createRequest.password)
    expect(dto.creationData.roles).toStrictEqual(createRequest.roles)
    expect((dto.creationData as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto.creationData as any).updatedAt).toBeUndefined() // should not be given from request
  })

  it('converts update request to update input dto', ({ unitFixture }) => {
    const updateRequest = unitFixture.updateUserRequest()
    const dto = userMapper.toUpdateUserInputDTO(updateRequest, unitFixture.userDTOMock().id)

    expect(dto.loggedInUserId).toBe(unitFixture.userDTOMock().id)
    expect(dto.updateData.id).toBeTypeOf('string')
    expect(dto.updateData.id).toBe(updateRequest.id)
    expect(dto.updateData.name).toBe(updateRequest.name)
    expect((dto.updateData as any).password).toBeUndefined() // should not be given from request
    expect((dto.updateData as any).oldPassword).toBe(updateRequest.oldPassword)
    expect((dto.updateData as any).newPassword).toBe(updateRequest.newPassword)
    expect(dto.updateData.email).toBe(updateRequest.email)
    expect(dto.updateData.roles).toStrictEqual(updateRequest.roles)
    expect(dto.updateData.active).toBe(false)
    expect((dto as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto as any).updatedAt).toBeUndefined() // should not be given from request
  })

  it('converts user dto to response', ({ unitFixture }) => {
    expect(userMapper.toResponse(unitFixture.userDTOMock())).toStrictEqual(_.omit(unitFixture.userDTOMock(), 'active'))
  })
})
