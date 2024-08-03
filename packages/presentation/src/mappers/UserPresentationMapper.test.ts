import { describe, expect, it } from 'vitest'
import { UserPresentationMapper } from './UserPresentationMapper'
import _ from 'lodash'
import { UserPresentation } from '../entities/UserPresentation'

describe('UserPresentationMapper', () => {
  const userMapper = new UserPresentationMapper()
  it('converts create request to create input dto', ({ unitFixture }) => {
    const createRequest = unitFixture.createUserRequest()
    const dto = userMapper.toCreateUserInputDTO(createRequest, unitFixture.loggedInUserId())

    expect((dto.creationData as any).id).toBeUndefined() // should not be given from request
    expect(dto.loggedInUserId).toBe(unitFixture.loggedInUserId())
    expect(dto.creationData.username).toBe(createRequest.username)
    expect(dto.creationData.email).toBe(createRequest.email)
    expect(dto.creationData.password).toBe(createRequest.password)
    expect(dto.creationData.roles).toStrictEqual(createRequest.roles)
    expect((dto.creationData as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto.creationData as any).updatedAt).toBeUndefined() // should not be given from request
  })

  it('converts update request to update input dto', ({ unitFixture }) => {
    const updateRequest = unitFixture.updateUserRequest()
    const dto = userMapper.toUpdateUserInputDTO(updateRequest, unitFixture.loggedInUserId())

    expect(dto.loggedInUserId).toBe(unitFixture.loggedInUserId())
    expect(dto.updateData.id).toBeTypeOf('string')
    expect(dto.updateData.id).toBe(updateRequest.id)
    expect(dto.updateData.username).toBe(updateRequest.username)
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
    expect(userMapper.toResponse(unitFixture.userDTO())).toStrictEqual(_.omit(unitFixture.userDTO(), 'active'))
  })

  it('converts user response to UserPresentation entity', ({ unitFixture }) => {
    expect(userMapper.toUserPresentation(unitFixture.userDTO())).toBeInstanceOf(UserPresentation)
  })
})
