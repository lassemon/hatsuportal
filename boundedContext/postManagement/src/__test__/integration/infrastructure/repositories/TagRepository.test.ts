import { beforeAll, describe, expect, it } from 'vitest'
import { uuid, unixtimeNow } from '@hatsuportal/common'
import { Tag, TagCreatorId, TagId, TagName, TagSlug } from '../../../../domain'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { TagRepository } from '../../../../infrastructure/repositories/TagRepository'
import { createTagRepository, seedTagFixture } from '../../../support/fixtures/tagFixture'
import { persistenceHarness } from '../../../setup.db'
import { ConcurrencyError, DataPersistenceError } from '@hatsuportal/platform'

describe('TagRepository (integration)', () => {
  let repository: TagRepository

  beforeAll(() => {
    repository = createTagRepository(persistenceHarness)
  })

  it('inserts a tag and loads it with findByIdForUpdate inside a unit of work', async ({ unitFixture }) => {
    await persistenceHarness.createUnitOfWork().execute(async () => {
      const tagMock = unitFixture.tagMock()
      await repository.insert(tagMock)

      const loaded = await repository.findByIdForUpdate(tagMock.id)

      expect(loaded?.slug.value).toBe(tagMock.slug.value)
      return [null]
    })
  })

  it('insert is idempotent when a tag with the same id already exists', async ({ unitFixture }) => {
    const { tag } = await seedTagFixture(persistenceHarness, unitFixture)

    const duplicateIdTag = Tag.reconstruct({
      id: tag.id,
      slug: new TagSlug(`different-slug-${uuid().slice(0, 8)}`),
      name: new TagName('Different name'),
      createdById: tag.createdById,
      createdAt: tag.createdAt,
      updatedAt: new UnixTimestamp(unixtimeNow())
    })

    let result: Tag | undefined
    await persistenceHarness.createUnitOfWork().execute(async () => {
      result = await repository.insert(duplicateIdTag)
      return [null]
    })

    expect(result?.slug.value).toBe(tag.slug.value)
    expect(result?.name.value).toBe(tag.name.value)

    const loaded = await repository.findById(tag.id)
    expect(loaded?.slug.value).toBe(tag.slug.value)
    expect(loaded?.name.value).toBe(tag.name.value)
    expect(await repository.findAll()).toHaveLength(1)
  })

  it('findAll returns inserted tags and enforces slug uniqueness', async ({ unitFixture }) => {
    const { tag } = await seedTagFixture(persistenceHarness, unitFixture)
    const all = await repository.findAll()
    expect(all.some((row) => row.id.equals(tag.id))).toBe(true)

    const now = unixtimeNow()
    const duplicateSlugTag = Tag.reconstruct({
      id: new TagId(uuid()),
      slug: tag.slug,
      name: new TagName('Duplicate slug tag'),
      createdById: new TagCreatorId(unitFixture.sampleUserId),
      createdAt: new CreatedAtTimestamp(now),
      updatedAt: new UnixTimestamp(now)
    })

    await expect(
      persistenceHarness.createUnitOfWork().execute(async () => {
        await repository.insert(duplicateSlugTag)
        return [null]
      })
    ).rejects.toSatisfy((error: unknown) => {
      return error instanceof DataPersistenceError && /unique|duplicate|slug/i.test(String(error.message))
    })
  })

  it('insertMany inserts multiple tags', async ({ unitFixture }) => {
    const now = unixtimeNow()
    const firstTag = Tag.reconstruct({
      id: new TagId(uuid()),
      slug: new TagSlug(`bulk-tag-a-${uuid().slice(0, 8)}`),
      name: new TagName('Bulk tag A'),
      createdById: new TagCreatorId(unitFixture.sampleUserId),
      createdAt: new CreatedAtTimestamp(now),
      updatedAt: new UnixTimestamp(now)
    })
    const secondTag = Tag.reconstruct({
      id: new TagId(uuid()),
      slug: new TagSlug(`bulk-tag-b-${uuid().slice(0, 8)}`),
      name: new TagName('Bulk tag B'),
      createdById: new TagCreatorId(unitFixture.sampleUserId),
      createdAt: new CreatedAtTimestamp(now),
      updatedAt: new UnixTimestamp(now)
    })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.insertMany([firstTag, secondTag])
      return [null]
    })

    const all = await repository.findAll()
    expect(all.some((row) => row.id.equals(firstTag.id))).toBe(true)
    expect(all.some((row) => row.id.equals(secondTag.id))).toBe(true)
  })

  it('updates a tag inside a unit of work', async ({ unitFixture }) => {
    const { tag } = await seedTagFixture(persistenceHarness, unitFixture)
    const renamed = new TagName(`Renamed ${uuid().slice(0, 8)}`)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(tag.id)
      if (!existing) throw new Error('expected tag')

      const updated = existing.clone()
      updated.updateName(renamed, tag.createdById)
      await repository.update(updated)

      const reloaded = await repository.findById(tag.id)
      expect(reloaded?.name.value).toBe(renamed.value)
      return [null]
    })
  })

  it('deleteMany removes tags by id', async ({ unitFixture }) => {
    const { tag: keepTag } = await seedTagFixture(persistenceHarness, unitFixture)
    const { tag: deleteTag } = await seedTagFixture(persistenceHarness, unitFixture)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.deleteMany([deleteTag.id])
      return [null]
    })

    expect(await repository.findById(deleteTag.id)).toBeNull()
    expect(await repository.findById(keepTag.id)).not.toBeNull()
  })

  it('throws ConcurrencyError when updating with stale version', async ({ unitFixture }) => {
    const { tag } = await seedTagFixture(persistenceHarness, unitFixture)

    await expect(
      persistenceHarness.createUnitOfWork().execute(async () => {
        const existing = await repository.findByIdForUpdate(tag.id)
        if (!existing) throw new Error('expected tag')

        const scope = persistenceHarness.transactionContext.getScope()
        if (!scope) throw new Error('expected active transaction scope')

        await scope.transaction
          .table('tags')
          .where('id', tag.id.value)
          .update({ updatedAt: unixtimeNow() + 10_000 })

        const updated = existing.clone()
        updated.updateName(new TagName('Stale rename attempt'), tag.createdById)
        await repository.update(updated)
        return [null]
      })
    ).rejects.toBeInstanceOf(ConcurrencyError)
  })
})
