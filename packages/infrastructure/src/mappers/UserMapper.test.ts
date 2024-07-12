import { describe, expect, it } from 'vitest'
import { UserMapper } from './UserMapper'
import { User } from '@hatsuportal/domain'

describe('UserMapper', () => {
  const userMapper = new UserMapper()
  it('converts create request to user', ({ unitFixture }) => {
    const createRequest = unitFixture.createUserRequest()
    const user = userMapper.createRequestToUser(createRequest)
    expect(user).toBeInstanceOf(User)

    expect(user.id).toBeTypeOf('string')
    expect(user.id).not.toBe((createRequest as any).id) // should not be given from request
    expect(user.name).toBe(createRequest.name)
    expect((user as any).password).toBeUndefined() // user instance should NEVER carry the password
    expect(user.email).toBe(createRequest.email)
    expect(user.roles).toStrictEqual(createRequest.roles)
    expect(user.active).toBe(true)
    expect(user.createdAt).not.toBe((createRequest as any).createdAt) // should not be given from request
    expect(user.updatedAt).toBeNull()
  })

  it('converts update request to user', ({ unitFixture }) => {
    const existingUser = unitFixture.user()
    const updateRequest = unitFixture.updateUserRequest()
    const user = userMapper.updateRequestToUser(existingUser, updateRequest)

    expect(user.id).toBeTypeOf('string')
    expect(user.id).toBe(updateRequest.id)
    expect(user.name).toBe(updateRequest.name)
    expect((user as any).password).toBeUndefined() // user instance should NEVER carry the password
    expect((user as any).oldPassword).toBeUndefined() // user instance should NEVER carry the password
    expect((user as any).newPassword).toBeUndefined() // user instance should NEVER carry the password
    expect(user.email).toBe(updateRequest.email)
    expect(user.roles).toStrictEqual(updateRequest.roles)
    expect(user.active).toBe(false)
    expect(user.createdAt).not.toBe((updateRequest as any).createdAt) // should not be able to update from request
    expect(user.updatedAt).not.toBe((updateRequest as any).updatedAt) // should not be able to update from request
  })

  it('converts user and password to insert query', async ({ unitFixture }) => {
    const user = unitFixture.user()
    const insertQuery = await userMapper.toInsertQuery(user, 'password')

    expect(insertQuery.id).toBeTypeOf('string')
    expect(insertQuery.id).toBe(user.id)
    expect(insertQuery.name).toBe(user.name)
    expect(insertQuery.password).not.toBe('password') // should always be encrypted
    expect(insertQuery.email).toBe(user.email)
    expect(insertQuery.roles).toBeTypeOf('string')
    expect(insertQuery.roles).toBe(JSON.stringify(user.roles))
    expect(insertQuery.active).toBe(1)
    expect(insertQuery.createdAt).toBe(user.createdAt) // should not be given from request
    expect(insertQuery.updatedAt).toBeNull()

    const insertQuery2 = await userMapper.toInsertQuery({ ...user, active: false }, 'password')
    expect(insertQuery2.active).toBe(0)
  })

  it('converts user and password to insert query', async ({ unitFixture }) => {
    const user = unitFixture.user()
    const updateQuery = await userMapper.toUpdateQuery(user, 'password')

    expect(updateQuery.id).toBeTypeOf('string')
    expect(updateQuery.id).toBe(user.id)
    expect(updateQuery.name).toBe(user.name)
    expect(updateQuery.password).not.toBe('password') // should always be encrypted
    expect(updateQuery.email).toBe(user.email)
    expect(updateQuery.roles).toBeTypeOf('string')
    expect(updateQuery.roles).toBe(JSON.stringify(user.roles))
    expect(updateQuery.active).toBe(1)
    expect((updateQuery as any).createdAt).toBeUndefined() // should not be able to update
    expect(updateQuery.updatedAt).not.toBe(user.updatedAt) // mapper should set new updated at timestamp

    const insertQuery2 = await userMapper.toUpdateQuery({ ...user, active: false }, 'password')
    expect(insertQuery2.active).toBe(0)
  })

  it('converts user database entity to user', ({ unitFixture }) => {
    const userDatabaseEntity = unitFixture.userDatabaseEntity()
    const user = userMapper.toUser(userDatabaseEntity)
    expect(user).toBeInstanceOf(User)
    expect(user.id).toBeTypeOf('string')
    expect(user.id).toBe(userDatabaseEntity.id)
    expect(user.name).toBe(userDatabaseEntity.name)
    expect((user as any).password).toBeUndefined()
    expect(user.email).toBe(userDatabaseEntity.email)
    expect(user.roles).toStrictEqual(JSON.parse(userDatabaseEntity.roles))
    expect(user.active).toBe(true)
    expect(user.createdAt).toBe(userDatabaseEntity.createdAt)
    expect(user.updatedAt).toBe(userDatabaseEntity.updatedAt)

    const user2 = userMapper.toUser({ ...userDatabaseEntity, active: 0 })
    expect(user2.active).toBe(false)
  })

  it('converts user JSON to user response', ({ unitFixture }) => {
    // this is more of a dummy test because currently no specific mapping is done from ImageDTO -> ImageResponseDTO
    expect(userMapper.toResponse(unitFixture.user())).toStrictEqual(unitFixture.user())
  })
})
