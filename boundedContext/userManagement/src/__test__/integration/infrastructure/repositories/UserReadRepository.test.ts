import { beforeAll, describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { DefaultThemeId, ProfileImageId, UserId, Password } from '../../../../domain'
import { UserReadRepository } from '../../../../infrastructure/repositories/UserReadRepository'
import { UserInfrastructureMapper } from '../../../../infrastructure/mappers/UserInfrastructureMapper'
import { UserWriteRepository } from '../../../../infrastructure/repositories/UserWriteRepository'
import { persistenceHarness } from '../../../setup.db'
import { insertImagesForeignKeyStub } from '../../../support/fkStubs/images'
import { StatusMessage } from '../../../../domain/valueObjects/StatusMessage'
import { Bio } from '../../../../domain/valueObjects/Bio'

describe('UserReadRepository (integration)', () => {
  let readRepository: UserReadRepository
  let writeRepository: UserWriteRepository

  beforeAll(() => {
    const mapper = new UserInfrastructureMapper()
    readRepository = new UserReadRepository(
      persistenceHarness.dataAccessProvider,
      persistenceHarness.repositoryHelpers,
      persistenceHarness.transactionContext,
      mapper
    )
    writeRepository = new UserWriteRepository(
      persistenceHarness.dataAccessProvider,
      persistenceHarness.repositoryHelpers,
      persistenceHarness.transactionContext,
      mapper
    )
  })

  async function insertUser(unitFixture: { userMock: typeof import('../../../testFactory').userMock }) {
    const userMock = unitFixture.userMock({ id: new UserId(uuid()) })
    await persistenceHarness.createUnitOfWork().execute(async () => {
      await writeRepository.insert(userMock, Password.create('ValidPassword123'))
      return [null]
    })
    return userMock
  }

  it('findById, findAll, and findByName return UserReadModelDTO with root and default profile fields', async ({ unitFixture }) => {
    const userMock = await insertUser(unitFixture)

    const byId = await readRepository.findById(userMock.id)
    const byName = await readRepository.findByName(userMock.name)
    const all = await readRepository.findAll()
    const fromAll = all.find((user) => user.id === userMock.id.value)

    expect(byId?.email).toBe(userMock.email.value)
    expect(byName?.name).toBe(userMock.name.value)
    expect(fromAll?.active).toBe(true)
    expect(byId).toMatchObject({
      id: userMock.id.value,
      email: userMock.email.value,
      name: userMock.name.value,
      active: true,
      bio: '',
      statusMessage: '',
      profileImageId: null,
      selectedThemeId: new DefaultThemeId().value
    })
    expect(byName).toMatchObject({ id: userMock.id.value, name: userMock.name.value })
    expect(fromAll).toBeDefined()
  })

  it('findByProfileImageId returns UserReadModelDTO rows', async ({ unitFixture }) => {
    const userMock = await insertUser(unitFixture)
    const imageId = uuid()
    await insertImagesForeignKeyStub(persistenceHarness, { id: imageId, createdById: userMock.id.value })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await writeRepository.findByIdForUpdate(userMock.id)
      if (!existing) throw new Error('expected user')
      existing.setProfileImage(new ProfileImageId(imageId), existing.id)
      existing.updateBio(new Bio('Reader bio'), existing.id)
      existing.updateStatusMessage(new StatusMessage('Online'), existing.id)
      await writeRepository.update(existing)
      return [null]
    })

    const matches = await readRepository.findByProfileImageId(new ProfileImageId(imageId))

    expect(matches).toHaveLength(1)
    expect(matches[0]?.bio).toBe('Reader bio')
    expect(matches[0]?.statusMessage).toBe('Online')
    expect(matches[0]?.profileImageId).toBe(imageId)
    expect(matches[0]?.selectedThemeId).toBe(new DefaultThemeId().value)
  })

  it('findAllReferencedProfileImageIds and findUserIdsBySelectedThemeId return scalars', async ({ unitFixture }) => {
    const userMock = await insertUser(unitFixture)
    const imageId = uuid()
    await insertImagesForeignKeyStub(persistenceHarness, { id: imageId, createdById: userMock.id.value })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await writeRepository.findByIdForUpdate(userMock.id)
      if (!existing) throw new Error('expected user')
      existing.setProfileImage(new ProfileImageId(imageId), existing.id)
      await writeRepository.update(existing)
      return [null]
    })

    const referencedIds = await readRepository.findAllReferencedProfileImageIds()
    const userIds = await readRepository.findUserIdsBySelectedThemeId(new DefaultThemeId().value)

    expect(referencedIds).toContain(imageId)
    expect(userIds).toContain(userMock.id.value)
  })
})
