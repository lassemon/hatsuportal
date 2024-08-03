import { beforeAll, describe, expect, it } from 'vitest'
import { ConcurrencyError, DataPersistenceError } from '@hatsuportal/platform'
import { UserRoleEnum, unixtimeNow, uuid } from '@hatsuportal/common'
import {
  ColorScheme,
  ColorSchemeEnum,
  DefaultThemeId,
  Email,
  Password,
  ProfileImageId,
  StatusMessage,
  UserId,
  UserName,
  UserRole
} from '../../../../domain'
import { UserWriteRepository } from '../../../../infrastructure/repositories/UserWriteRepository'
import { UserInfrastructureMapper } from '../../../../infrastructure/mappers/UserInfrastructureMapper'
import { Encryption } from '../../../../application/auth/Encryption'
import { persistenceHarness } from '../../../setup.db'
import { insertImagesForeignKeyStub } from '../../../support/fkStubs/images'
import { Bio } from '../../../../domain/valueObjects/Bio'

describe('UserWriteRepository (integration)', () => {
  let repository: UserWriteRepository

  beforeAll(() => {
    repository = new UserWriteRepository(
      persistenceHarness.dataAccessProvider,
      persistenceHarness.repositoryHelpers,
      persistenceHarness.transactionContext,
      new UserInfrastructureMapper()
    )
  })

  async function insertUser(
    unitFixture: { userMock: typeof import('../../../testFactory').userMock },
    overrides: Parameters<typeof unitFixture.userMock>[0] = {},
    password = 'ValidPassword123'
  ) {
    const userMock = unitFixture.userMock({ id: new UserId(uuid()), ...overrides })
    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.insert(userMock, Password.create(password))
      return [null]
    })
    return { userMock, password }
  }

  it('inserts a user and loads it with findByIdForUpdate inside a unit of work', async ({ unitFixture }) => {
    await persistenceHarness.createUnitOfWork().execute(async () => {
      const userMock = unitFixture.userMock({ id: new UserId(uuid()) })
      await repository.insert(userMock, Password.create('ValidPassword123'))

      const loaded = await repository.findByIdForUpdate(userMock.id)

      expect(loaded?.name.value).toBe(userMock.name.value)
      return [null]
    })
  })

  it('insert is idempotent when a user with the same id already exists', async ({ unitFixture }) => {
    const { userMock, password } = await insertUser(unitFixture)

    const duplicateIdUser = unitFixture.userMock({
      id: userMock.id,
      email: new Email('different@hatsuportal.test')
    })

    let result: Awaited<ReturnType<UserWriteRepository['insert']>> | undefined
    await persistenceHarness.createUnitOfWork().execute(async () => {
      result = await repository.insert(duplicateIdUser, Password.create('AnotherValidPassword456'))
      return [null]
    })

    expect(result?.email.value).toBe(userMock.email.value)
    expect(result?.name.value).toBe(userMock.name.value)

    const loaded = await repository.findById(userMock.id)
    expect(loaded?.email.value).toBe(userMock.email.value)

    const creds = await repository.getUserCredentialsByUserId(userMock.id)
    expect(creds?.passwordHash).toBeTruthy()
    expect(creds?.passwordHash).not.toBe(password)
    expect(creds?.passwordHash).not.toBe('AnotherValidPassword456')
  })

  it('findById returns inserted user and null for unknown id', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)

    const found = await repository.findById(userMock.id)
    const missing = await repository.findById(new UserId('00000000-0000-4000-8000-000000000099'))

    expect(found?.id.value).toBe(userMock.id.value)
    expect(missing).toBeNull()
  })

  it('findByName returns inserted user', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)

    const byName = await repository.findByName(userMock.name)

    expect(byName?.id.value).toBe(userMock.id.value)
  })

  it('getUserCredentialsByUserId returns password hash for inserted user', async ({ unitFixture }) => {
    const { userMock, password } = await insertUser(unitFixture)

    const credsById = await repository.getUserCredentialsByUserId(userMock.id)

    expect(credsById?.userId).toBe(userMock.id.value)
    expect(credsById?.passwordHash).toBeTruthy()
    expect(credsById?.passwordHash).not.toBe(password)
  })

  it('getUserCredentialsByUsername returns password hash for inserted user', async ({ unitFixture }) => {
    const { userMock, password } = await insertUser(unitFixture)

    const credsByUsername = await repository.getUserCredentialsByUsername(userMock.name)

    expect(credsByUsername?.userId).toBe(userMock.id.value)
    expect(credsByUsername?.passwordHash).toBeTruthy()
    expect(credsByUsername?.passwordHash).not.toBe(password)
  })

  it('findByName returns null for unknown username', async () => {
    const missing = await repository.findByName(new UserName(`missing-${uuid().slice(0, 8)}`))
    expect(missing).toBeNull()
  })

  it('credential lookups return null for unknown ids', async () => {
    const unknownId = new UserId('00000000-0000-4000-8000-000000000099')
    const unknownName = new UserName(`missing-${uuid().slice(0, 8)}`)

    expect(await repository.getUserCredentialsByUserId(unknownId)).toBeNull()
    expect(await repository.getUserCredentialsByUsername(unknownName)).toBeNull()
  })

  it('updates a user inside a unit of work', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(userMock.id)
      if (!existing) throw new Error('expected user')

      const updated = existing.clone()
      updated.changeEmail(new Email('updated@hatsuportal.test'), userMock.id)

      const saved = await repository.update(updated)
      expect(saved.email.value).toBe('updated@hatsuportal.test')
      return [null]
    })
  })

  it('persists password update verifiable via Encryption.compare', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)
    const newPassword = Password.create('NewValidPassword456')

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(userMock.id)
      if (!existing) throw new Error('expected user')

      await repository.update(existing, newPassword)
      return [null]
    })

    const creds = await repository.getUserCredentialsByUserId(userMock.id)
    expect(creds?.passwordHash).toBeTruthy()
    expect(await Encryption.compare('NewValidPassword456', creds!.passwordHash)).toBe(true)
    expect(await Encryption.compare('ValidPassword123', creds!.passwordHash)).toBe(false)
  })

  it('round-trips multi-role users through JSONB on insert and update', async ({ unitFixture }) => {
    const roles = [new UserRole(UserRoleEnum.Admin), new UserRole(UserRoleEnum.Viewer)]
    const { userMock } = await insertUser(unitFixture, { roles })

    let loaded = await repository.findById(userMock.id)
    expect(loaded?.roles.map((role) => role.value).sort()).toEqual([UserRoleEnum.Admin, UserRoleEnum.Viewer].sort())

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(userMock.id)
      if (!existing) throw new Error('expected user')

      const updated = existing.clone()
      updated.changeRoles([new UserRole(UserRoleEnum.Moderator)], userMock.id)
      await repository.update(updated)
      return [null]
    })

    loaded = await repository.findById(userMock.id)
    expect(loaded?.roles.map((role) => role.value)).toEqual([UserRoleEnum.Moderator])
  })

  it('reflects renamed user in findByName', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)
    const renamed = new UserName(`renamed-${uuid().slice(0, 8)}`)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(userMock.id)
      if (!existing) throw new Error('expected user')

      const updated = existing.clone()
      updated.rename(renamed, userMock.id)
      await repository.update(updated)
      return [null]
    })

    expect(await repository.findByName(userMock.name)).toBeNull()
    expect((await repository.findByName(renamed))?.id.value).toBe(userMock.id.value)
  })

  it('throws ConcurrencyError when updating with stale version', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)

    await expect(
      persistenceHarness.createUnitOfWork().execute(async () => {
        const existing = await repository.findByIdForUpdate(userMock.id)
        if (!existing) throw new Error('expected user')

        const scope = persistenceHarness.transactionContext.getScope()
        if (!scope) throw new Error('expected active transaction scope')

        await scope.transaction
          .table('users')
          .where('id', userMock.id.value)
          .update({ updatedAt: unixtimeNow() + 10_000 })

        await repository.update(existing.clone())
        return [null]
      })
    ).rejects.toBeInstanceOf(ConcurrencyError)
  })

  it('throws ConcurrencyError when deactivating with stale version', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)

    await expect(
      persistenceHarness.createUnitOfWork().execute(async () => {
        const existing = await repository.findByIdForUpdate(userMock.id)
        if (!existing) throw new Error('expected user')

        const scope = persistenceHarness.transactionContext.getScope()
        if (!scope) throw new Error('expected active transaction scope')

        await scope.transaction
          .table('users')
          .where('id', userMock.id.value)
          .update({ updatedAt: unixtimeNow() + 10_000 })

        await repository.deactivate(existing)
        return [null]
      })
    ).rejects.toBeInstanceOf(ConcurrencyError)
  })

  it('throws when update is called without prior findByIdForUpdate', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)

    await expect(
      persistenceHarness.createUnitOfWork().execute(async () => {
        const loaded = await repository.findById(userMock.id)
        if (!loaded) throw new Error('expected user')
        await repository.update(loaded)
        return [null]
      })
    ).rejects.toSatisfy((error: unknown) => {
      const message = error instanceof Error ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ''}` : String(error)
      return /optimistic write/i.test(message)
    })
  })

  it('deactivates a user', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(userMock.id)
      if (!existing) throw new Error('expected user')

      const deactivated = await repository.deactivate(existing)
      expect(deactivated.active).toBe(false)
      return [null]
    })

    const loaded = await repository.findById(userMock.id)
    expect(loaded?.active).toBe(false)
  })

  it('throws when inserting duplicate email', async ({ unitFixture }) => {
    const sharedEmail = new Email(`dup-${uuid().slice(0, 8)}@hatsuportal.test`)
    await insertUser(unitFixture, { email: sharedEmail })

    const duplicateEmailUser = unitFixture.userMock({
      id: new UserId(uuid()),
      email: sharedEmail
    })

    await expect(
      persistenceHarness.createUnitOfWork().execute(async () => {
        await repository.insert(duplicateEmailUser, Password.create('ValidPassword123'))
        return [null]
      })
    ).rejects.toBeInstanceOf(DataPersistenceError)
  })

  it('insert creates user_profiles and user_preferences rows', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)

    const profile = await persistenceHarness.dataAccessProvider.table('user_profiles').where('userId', userMock.id.value).first()
    const preferences = await persistenceHarness.dataAccessProvider.table('user_preferences').where('userId', userMock.id.value).first()

    expect(profile).toBeDefined()
    expect(preferences?.selectedThemeId).toBe(new DefaultThemeId().value)
  })

  it('loads full aggregate from findById, findByIdForUpdate, and findByName', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const forUpdate = await repository.findByIdForUpdate(userMock.id)
      if (!forUpdate) throw new Error('expected user')
      forUpdate.updateBio(new Bio('Integration bio'), userMock.id)
      forUpdate.updateStatusMessage(new StatusMessage('Available'), userMock.id)
      await repository.update(forUpdate)
      return [null]
    })

    const byId = await repository.findById(userMock.id)
    const byName = await repository.findByName(userMock.name)

    expect(byId?.profile.bio.value).toBe('Integration bio')
    expect(byName?.profile.statusMessage.value).toBe('Available')
    expect(byId?.preferences.selectedThemeId.value).toBe(new DefaultThemeId().value)
  })

  it('syncs profile image link on update', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)
    const imageId = uuid()

    await insertImagesForeignKeyStub(persistenceHarness, { id: imageId, createdById: userMock.id.value })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(userMock.id)
      if (!existing) throw new Error('expected user')
      existing.setProfileImage(new ProfileImageId(imageId), userMock.id)
      await repository.update(existing)
      return [null]
    })

    let link = await persistenceHarness.dataAccessProvider.table('user_image_links').where({ userId: userMock.id.value, imageId }).first()
    expect(link).toBeDefined()

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(userMock.id)
      if (!existing) throw new Error('expected user')
      existing.setProfileImage(ProfileImageId.NOT_SET, userMock.id)
      await repository.update(existing)
      return [null]
    })

    link = await persistenceHarness.dataAccessProvider.table('user_image_links').where({ userId: userMock.id.value, imageId }).first()
    expect(link).toBeUndefined()
  })

  it('password-only update re-syncs child tables with unchanged values', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)
    const profileBefore = await persistenceHarness.dataAccessProvider.table('user_profiles').where('userId', userMock.id.value).first()

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(userMock.id)
      if (!existing) throw new Error('expected user')
      await repository.update(existing, Password.create('AnotherValidPassword789'))
      return [null]
    })

    const profileAfter = await persistenceHarness.dataAccessProvider.table('user_profiles').where('userId', userMock.id.value).first()
    expect(profileAfter?.bio).toBe(profileBefore?.bio)
    expect(profileAfter?.statusMessage).toBe(profileBefore?.statusMessage)
  })

  it('persists preference changes through update', async ({ unitFixture }) => {
    const { userMock } = await insertUser(unitFixture)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(userMock.id)
      if (!existing) throw new Error('expected user')
      existing.updateColorScheme(new ColorScheme(ColorSchemeEnum.Dark), userMock.id)
      await repository.update(existing)
      return [null]
    })

    const loaded = await repository.findById(userMock.id)
    expect(loaded?.preferences.colorScheme.value).toBe(ColorSchemeEnum.Dark)
  })
})
