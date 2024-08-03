import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UniqueId } from '@hatsuportal/shared-kernel'
import { InvalidInputError } from '@hatsuportal/platform'
import { ResolveStoryTagIdsService } from './ResolveStoryTagIdsService'
import * as Fixture from '../../../__test__/testFactory'
import { Tag } from '../../../domain'

describe('ResolveStoryTagIdsService', () => {
  const createdBy = new UniqueId(Fixture.sampleUserId)

  let tagRepository: ReturnType<typeof Fixture.tagRepositoryMock>

  beforeEach(() => {
    tagRepository = Fixture.tagRepositoryMock()
    vi.mocked(tagRepository.insertMany).mockImplementation((tags) => Promise.resolve([...tags]))
  })

  const createService = () => new ResolveStoryTagIdsService(tagRepository)

  it('returns empty array when incomingTags is empty', async () => {
    const service = createService()
    const result = await service.resolve(createdBy, [])
    expect(result).toEqual([])
    expect(tagRepository.findByIds).not.toHaveBeenCalled()
    expect(tagRepository.insertMany).not.toHaveBeenCalled()
  })

  it('returns existing tag ids when only existing tags are provided', async () => {
    const existingId1 = Fixture.sampleTagId
    const existingId2 = 'test1b19-tag-4792-a2f0-f95ccab82d92-b3g1-g06dd3nf3met'
    vi.mocked(tagRepository.findByIds).mockImplementation(async (ids) =>
      ids.map((id) =>
        Tag.reconstruct({
          id,
          slug: Fixture.tagMock().slug,
          name: Fixture.tagMock().name,
          createdById: Fixture.tagMock().createdById,
          createdAt: Fixture.tagMock().createdAt,
          updatedAt: Fixture.tagMock().updatedAt
        })
      )
    )

    const service = createService()
    const result = await service.resolve(createdBy, [{ id: existingId1 }, { id: existingId2 }])

    expect(result).toEqual([existingId1, existingId2])
    expect(tagRepository.findByIds).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ value: existingId1 }), expect.objectContaining({ value: existingId2 })])
    )
    expect(tagRepository.insertMany).not.toHaveBeenCalled()
  })

  it('creates new tags and returns their ids when only new tags are provided', async () => {
    const service = createService()
    const result = await service.resolve(createdBy, [{ name: 'Adventure' }, { name: 'Fantasy' }])

    expect(result).toHaveLength(2)
    expect(tagRepository.findByIds).not.toHaveBeenCalled()
    expect(tagRepository.insertMany).toHaveBeenCalledTimes(1)
    const insertedTags = vi.mocked(tagRepository.insertMany).mock.calls[0][0]
    expect(insertedTags).toHaveLength(2)
    expect(insertedTags[0].name.value).toBe('Adventure')
    expect(insertedTags[1].name.value).toBe('Fantasy')
    expect(result).toEqual(insertedTags.map((t) => t.id.value))
  })

  it('trims whitespace from new tag names', async () => {
    const service = createService()
    await service.resolve(createdBy, [{ name: '  Sci-Fi  ' }])

    const insertedTags = vi.mocked(tagRepository.insertMany).mock.calls[0][0]
    expect(insertedTags[0].name.value).toBe('Sci-Fi')
  })

  it('returns mixed existing and created tag ids', async () => {
    const existingId = Fixture.sampleTagId
    vi.mocked(tagRepository.findByIds).mockImplementation(async (ids) =>
      ids.map((id) =>
        Tag.reconstruct({
          id,
          slug: Fixture.tagMock().slug,
          name: Fixture.tagMock().name,
          createdById: Fixture.tagMock().createdById,
          createdAt: Fixture.tagMock().createdAt,
          updatedAt: Fixture.tagMock().updatedAt
        })
      )
    )

    const service = createService()
    const result = await service.resolve(createdBy, [{ id: existingId }, { name: 'NewTag' }])

    expect(result[0]).toBe(existingId)
    expect(result[1]).toBeDefined()
    expect(result).toHaveLength(2)
    expect(tagRepository.findByIds).toHaveBeenCalled()
    expect(tagRepository.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: expect.objectContaining({ value: 'NewTag' }) })])
    )
  })

  it.each([
    { label: 'empty object', input: [{}] },
    { label: 'object with wrong keys', input: [{ otherKey: 'value' }] },
    { label: 'object with slug only', input: [{ slug: 'tag-slug' }] },
    { label: 'mixed valid and invalid', input: [{ id: Fixture.sampleTagId }, { slug: 'invalid' }] }
  ])('throws InvalidInputError when tag entry has neither id nor name ($label)', async ({ input }) => {
    const service = createService()
    const promise = service.resolve(createdBy, input as { id: string }[])
    await expect(promise).rejects.toThrow(InvalidInputError)
    await expect(promise).rejects.toThrow('Each tag entry must be either { id } or { name }.')
  })

  it('throws InvalidInputError when one or more existing tag ids do not exist', async () => {
    const existingId = Fixture.sampleTagId
    const missingId = 'non-existent-tag-id-0000-0000-000000000000'
    vi.mocked(tagRepository.findByIds).mockResolvedValue([Fixture.tagMock()])

    const service = createService()
    const promise = service.resolve(createdBy, [{ id: existingId }, { id: missingId }])
    await expect(promise).rejects.toThrow(InvalidInputError)
    await expect(promise).rejects.toThrow(missingId)
  })

  it('handles duplicate existing ids', async () => {
    const existingId = Fixture.sampleTagId
    vi.mocked(tagRepository.findByIds).mockImplementation(async (ids) =>
      ids.map((id) =>
        Tag.reconstruct({
          id,
          slug: Fixture.tagMock().slug,
          name: Fixture.tagMock().name,
          createdById: Fixture.tagMock().createdById,
          createdAt: Fixture.tagMock().createdAt,
          updatedAt: Fixture.tagMock().updatedAt
        })
      )
    )

    const service = createService()
    const result = await service.resolve(createdBy, [{ id: existingId }, { id: existingId }])

    expect(result).toEqual([existingId, existingId])
    expect(tagRepository.findByIds).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ value: existingId })]))
  })
})
