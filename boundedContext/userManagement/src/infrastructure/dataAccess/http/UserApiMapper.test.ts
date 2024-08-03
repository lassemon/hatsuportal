import { describe, expect, it } from 'vitest'
import { InvalidRequestError } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
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

  it('defaults create roles to Viewer when none are provided', ({ unitFixture }) => {
    const createRequest = unitFixture.createUserRequest()
    createRequest.roles = []
    expect(userMapper.toCreateUserInputDTO(createRequest, unitFixture.sampleUserId).roles).toStrictEqual([UserRoleEnum.Viewer])
  })

  it('throws on create when authentication or required fields are missing', ({ unitFixture }) => {
    const createRequest = unitFixture.createUserRequest()
    expect(() => userMapper.toCreateUserInputDTO(createRequest)).toThrow(InvalidRequestError)
    expect(() => userMapper.toCreateUserInputDTO({ ...createRequest, name: '' }, unitFixture.sampleUserId)).toThrow(InvalidRequestError)
    expect(() => userMapper.toCreateUserInputDTO({ ...createRequest, email: '' }, unitFixture.sampleUserId)).toThrow(InvalidRequestError)
    expect(() => userMapper.toCreateUserInputDTO({ ...createRequest, password: '' }, unitFixture.sampleUserId)).toThrow(
      InvalidRequestError
    )
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

  it('throws on update when authentication is missing', ({ unitFixture }) => {
    expect(() => userMapper.toUpdateUserInputDTO(unitFixture.updateUserRequest(), unitFixture.sampleUserId)).toThrow(
      InvalidRequestError
    )
  })

  it('converts find request to find input dto', ({ unitFixture }) => {
    expect(userMapper.toFindUserInputDTO(unitFixture.sampleUserId, unitFixture.sampleUserId)).toStrictEqual({
      userIdToFind: unitFixture.sampleUserId
    })
  })

  it('throws on find when authentication or user id is missing', ({ unitFixture }) => {
    expect(() => userMapper.toFindUserInputDTO(unitFixture.sampleUserId, '')).toThrow(InvalidRequestError)
    expect(() => userMapper.toFindUserInputDTO('', unitFixture.sampleUserId)).toThrow(InvalidRequestError)
  })

  it('converts deactivate request to deactivate input dto', ({ unitFixture }) => {
    expect(userMapper.toDeactivateUserInputDTO(unitFixture.sampleUserId, unitFixture.sampleUserId)).toStrictEqual({
      userIdToDeactivate: unitFixture.sampleUserId
    })
  })

  it('throws on deactivate when authentication or user id is missing', ({ unitFixture }) => {
    expect(() => userMapper.toDeactivateUserInputDTO(unitFixture.sampleUserId)).toThrow(InvalidRequestError)
    expect(() => userMapper.toDeactivateUserInputDTO('', unitFixture.sampleUserId)).toThrow(InvalidRequestError)
  })

  it('converts user dto to response', ({ unitFixture }) => {
    expect(userMapper.toResponse(unitFixture.userDTOMock())).toStrictEqual(_.omit(unitFixture.userDTOMock(), 'active'))
  })
})
