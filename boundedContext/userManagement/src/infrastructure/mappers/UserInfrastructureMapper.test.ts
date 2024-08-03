import { describe, expect, it } from 'vitest'
import { UserInfrastructureMapper } from './UserInfrastructureMapper'
import { StrictPasswordPolicy } from '../authentication/StrictPasswordPolicy'
import { PasswordFactory } from '../../application/authentication/PasswordFactory'

describe('UserMapper', () => {
  const passwordPolicy = new StrictPasswordPolicy()
  const passwordFactory = new PasswordFactory(passwordPolicy)
  const userMapper = new UserInfrastructureMapper()

  it('converts user and password to insert query', async ({ unitFixture }) => {
    const user = unitFixture.userMock()
    const insertQuery = await userMapper.toInsertQuery(user, passwordFactory.create('TestPassword123'))

    expect(insertQuery.id).toBeTypeOf('string')
    expect(insertQuery.id).toBe(user.id.value)
    expect(insertQuery.name).toBe(user.name.value)
    expect(insertQuery.password).not.toBe('TestPassword123') // should always be encrypted
    expect(insertQuery.email).toBe(user.email.value)
    expect(insertQuery.roles).toStrictEqual(user.roles.map((role) => role.value))
    expect(insertQuery.active).toBe(true)
    expect(insertQuery.createdAt).not.toBe(user.createdAt.value) // should not be given from request
    expect(insertQuery.updatedAt).toBe(insertQuery.createdAt) // newly created user should have same created and updated at timestamp

    const insertQuery2 = await userMapper.toInsertQuery(unitFixture.userMock({ active: false }), passwordFactory.create('TestPassword123'))
    expect(insertQuery2.active).toBe(false)
  })

  it('converts user and password to update query', async ({ unitFixture }) => {
    const user = unitFixture.userMock()
    const updateQuery = await userMapper.toUpdateQuery(user, passwordFactory.create('TestPassword123'))

    expect(updateQuery.id).toBeTypeOf('string')
    expect(updateQuery.id).toBe(user.id.value)
    expect(updateQuery.name).toBe(user.name.value)
    expect(updateQuery.password).not.toBe('TestPassword123') // should always be encrypted
    expect(updateQuery.email).toBe(user.email.value)
    expect(updateQuery.roles).toStrictEqual(user.roles.map((role) => role.value))
    expect(updateQuery.active).toBe(true)
    expect((updateQuery as any).createdAt).toBeUndefined() // should not be able to update
    expect(updateQuery.updatedAt).not.toBe(user.updatedAt.value) // mapper should set new updated at timestamp

    const insertQuery2 = await userMapper.toUpdateQuery(unitFixture.userMock({ active: false }), passwordFactory.create('TestPassword123'))
    expect(insertQuery2.active).toBe(false)
  })

  it('converts user database record to dto', ({ unitFixture }) => {
    const userRecord = unitFixture.userDatabaseRecord()
    const dto = userMapper.toDTO(userRecord)
    expect(dto.id).toBeTypeOf('string')
    expect(dto.id).toBe(userRecord.id)
    expect(dto.name).toBe(userRecord.name)
    expect((dto as any).password).toBeUndefined()
    expect(dto.email).toBe(userRecord.email)
    expect(dto.roles).toStrictEqual(userRecord.roles)
    expect(dto.active).toBe(true)
    expect(dto.createdAt).toBe(userRecord.createdAt)
    expect(dto.updatedAt).toBe(userRecord.updatedAt)

    const user2 = userMapper.toDTO({ ...userRecord, active: false })
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
    expect(user.roles.map((role) => role.value)).toStrictEqual(userRecord.roles)
    expect(user.active).toBe(true)
    expect(user.createdAt.value).toBe(userRecord.createdAt)
    expect(user.updatedAt?.value).toBe(userRecord.updatedAt)

    const user2 = userMapper.toDomainEntity({ ...userRecord, active: false })
    expect(user2.active).toBe(false)
  })

  it('converts create user input to user entity', ({ unitFixture }) => {
    // TODO: Add test for create user input to user entity
  })
})
