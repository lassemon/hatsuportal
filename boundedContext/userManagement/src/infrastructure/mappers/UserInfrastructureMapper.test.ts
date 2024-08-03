import { describe, expect, it } from 'vitest'
import { UserInfrastructureMapper } from './UserInfrastructureMapper'
import { Password, User } from '../../domain'

describe('UserMapper', () => {
  const userMapper = new UserInfrastructureMapper()

  it('converts user and password to insert query', async ({ unitFixture }) => {
    const dto = unitFixture.userDTOMock()
    const user = User.create(dto)
    const insertQuery = await userMapper.toInsertQuery(user, new Password('TestPassword123'))

    expect(insertQuery.id).toBeTypeOf('string')
    expect(insertQuery.id).toBe(dto.id)
    expect(insertQuery.name).toBe(dto.name)
    expect(insertQuery.password).not.toBe('TestPassword123') // should always be encrypted
    expect(insertQuery.email).toBe(dto.email)
    expect(insertQuery.roles).toBeTypeOf('string')
    expect(insertQuery.roles).toBe(JSON.stringify(dto.roles))
    expect(insertQuery.active).toBe(1)
    expect(insertQuery.createdAt).not.toBe(dto.createdAt) // should not be given from request
    expect(insertQuery.updatedAt).toBe(insertQuery.createdAt) // newly created user should have same created and updated at timestamp

    const insertQuery2 = await userMapper.toInsertQuery(
      User.create({ ...unitFixture.userDTOMock(), active: false }),
      new Password('TestPassword123')
    )
    expect(insertQuery2.active).toBe(0)
  })

  it('converts user and password to update query', async ({ unitFixture }) => {
    const dto = unitFixture.userDTOMock()
    const user = User.create(dto)
    const updateQuery = await userMapper.toUpdateQuery(user, new Password('TestPassword123'))

    expect(updateQuery.id).toBeTypeOf('string')
    expect(updateQuery.id).toBe(dto.id)
    expect(updateQuery.name).toBe(dto.name)
    expect(updateQuery.password).not.toBe('TestPassword123') // should always be encrypted
    expect(updateQuery.email).toBe(dto.email)
    expect(updateQuery.roles).toBeTypeOf('string')
    expect(updateQuery.roles).toBe(JSON.stringify(dto.roles))
    expect(updateQuery.active).toBe(1)
    expect((updateQuery as any).createdAt).toBeUndefined() // should not be able to update
    expect(updateQuery.updatedAt).not.toBe(dto.updatedAt) // mapper should set new updated at timestamp

    const insertQuery2 = await userMapper.toUpdateQuery(
      User.create({ ...unitFixture.userDTOMock(), active: false }),
      new Password('TestPassword123')
    )
    expect(insertQuery2.active).toBe(0)
  })

  it('converts user database record to dto', ({ unitFixture }) => {
    const userRecord = unitFixture.userDatabaseRecord()
    const dto = userMapper.toDTO(userRecord)
    expect(dto.id).toBeTypeOf('string')
    expect(dto.id).toBe(userRecord.id)
    expect(dto.name).toBe(userRecord.name)
    expect((dto as any).password).toBeUndefined()
    expect(dto.email).toBe(userRecord.email)
    expect(dto.roles).toStrictEqual(JSON.parse(userRecord.roles))
    expect(dto.active).toBe(true)
    expect(dto.createdAt).toBe(userRecord.createdAt)
    expect(dto.updatedAt).toBe(userRecord.updatedAt)

    const user2 = userMapper.toDTO({ ...userRecord, active: 0 })
    expect(user2.active).toBe(false)
  })

  it('converts user database record to domain entity', ({ unitFixture }) => {
    const userRecord = unitFixture.userDatabaseRecord()
    const user = userMapper.toDomainEntity(userRecord)
    expect(user.id.value).toBeTypeOf('string')
    expect(user.id.value).toBe(userRecord.id)
    expect(user.name.value).toBe(userRecord.name)
    expect((user as any).password).toBeUndefined()
    expect(user.email.value).toBe(userRecord.email)
    expect(user.roles.map((role) => role.value)).toStrictEqual(JSON.parse(userRecord.roles))
    expect(user.active).toBe(true)
    expect(user.createdAt.value).toBe(userRecord.createdAt)
    expect(user.updatedAt?.value).toBe(userRecord.updatedAt)

    const user2 = userMapper.toDomainEntity({ ...userRecord, active: 0 })
    expect(user2.active).toBe(false)
  })

  it('converts create user input to user entity', ({ unitFixture }) => {
    // TODO: Add test for create user input to user entity
  })
})
