import { beforeAll, describe, expect, it } from 'vitest'
import { UserRoleEnum, uuid, unixtimeNow } from '@hatsuportal/common'
import { Tag, TagCreatorId, TagId, TagName, TagSlug } from '@hatsuportal/post-management'
import { Email, Password, User, UserId, UserName, UserRole } from '@hatsuportal/user-management'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { createIntegrationWiring } from '../../../../support/integration/IntegrationWiring'

describe('UnitOfWork (integration)', () => {
  let wiring: ReturnType<typeof createIntegrationWiring>

  beforeAll(() => {
    wiring = createIntegrationWiring()
  })

  it('commits a tag insert made inside execute', async ({ unitFixture }) => {
    const now = unixtimeNow()
    const slugSuffix = uuid().slice(0, 8)
    const tag = Tag.reconstruct({
      id: new TagId(uuid()),
      slug: new TagSlug(`tag-${slugSuffix}`),
      name: new TagName(`Tag ${slugSuffix}`),
      createdById: new TagCreatorId(unitFixture.sampleUserId),
      createdAt: new CreatedAtTimestamp(now),
      updatedAt: new UnixTimestamp(now)
    })

    await wiring.unitOfWork.execute(async () => {
      await wiring.tagRepository.insert(tag)
      return [null]
    })

    const loaded = await wiring.tagRepository.findById(tag.id)
    expect(loaded?.slug.value).toBe(tag.slug.value)
  })

  it('rolls back a tag insert when execute throws', async ({ unitFixture }) => {
    const now = unixtimeNow()
    const slugSuffix = uuid().slice(0, 8)
    const tag = Tag.reconstruct({
      id: new TagId(uuid()),
      slug: new TagSlug(`rollback-${slugSuffix}`),
      name: new TagName(`Rollback Tag ${slugSuffix}`),
      createdById: new TagCreatorId(unitFixture.sampleUserId),
      createdAt: new CreatedAtTimestamp(now),
      updatedAt: new UnixTimestamp(now)
    })

    await expect(
      wiring.unitOfWork.execute(async () => {
        await wiring.tagRepository.insert(tag)
        throw new Error('force rollback')
      })
    ).rejects.toThrow('Transaction failed')

    const loaded = await wiring.tagRepository.findById(tag.id)
    expect(loaded).toBeNull()
  })

  it('persists domain events to the outbox on commit', async ({ unitFixture }) => {
    const userId = uuid()
    const now = unixtimeNow()
    const user = User.create(
      {
        id: new UserId(userId),
        name: new UserName(`outboxuser${userId.slice(0, 8)}`),
        email: new Email(`outbox${userId.slice(0, 8)}@hatsuportal.test`),
        active: true,
        profile: unitFixture.userMock().profile,
        preferences: unitFixture.userMock().preferences,
        roles: [new UserRole(UserRoleEnum.Viewer)],
        createdAt: new CreatedAtTimestamp(now),
        updatedAt: new UnixTimestamp(now)
      },
      userId
    )

    await wiring.unitOfWork.execute(async () => {
      await wiring.userWriteRepository.insert(user, Password.create('ValidPassword123'))
      return [user]
    })

    const loaded = await wiring.userWriteRepository.findById(user.id)
    expect(loaded?.id.value).toBe(userId)

    const outboxRows = await wiring.dataAccessProvider
      .table('domain_event_outbox')
      .andWhereRaw("serialized_event_data::jsonb ->> 'id' = ?", [userId])

    expect(outboxRows.some((row: { eventType: string }) => row.eventType === 'UserCreated')).toBe(true)
  })

  it('does not persist user or outbox rows when execute throws after returning an event holder', async ({ unitFixture }) => {
    const userId = uuid()
    const now = unixtimeNow()
    const user = User.create(
      {
        id: new UserId(userId),
        name: new UserName(`rollbackuser${userId.slice(0, 8)}`),
        email: new Email(`rollback${userId.slice(0, 8)}@hatsuportal.test`),
        active: true,
        profile: unitFixture.userMock().profile,
        preferences: unitFixture.userMock().preferences,
        roles: [new UserRole(UserRoleEnum.Viewer)],
        createdAt: new CreatedAtTimestamp(now),
        updatedAt: new UnixTimestamp(now)
      },
      userId
    )

    await expect(
      wiring.unitOfWork.execute(async () => {
        await wiring.userWriteRepository.insert(user, Password.create('ValidPassword123'))
        throw new Error('force rollback after insert')
        return [user]
      })
    ).rejects.toThrow('Transaction failed')

    const loaded = await wiring.userWriteRepository.findById(user.id)
    expect(loaded).toBeNull()

    const outboxRows = await wiring.dataAccessProvider
      .table('domain_event_outbox')
      .andWhereRaw("serialized_event_data::jsonb ->> 'id' = ?", [userId])

    expect(outboxRows).toHaveLength(0)
  })
})
