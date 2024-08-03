import { describe, expect, it, vi } from 'vitest'
import { ICache, ITransactionScope } from '@hatsuportal/platform'
import { ImageId, ImageVersionId } from '../../domain'
import { ImageMetadataDTO } from '../../application/dtos/ImageMetadataDTO'
import { ImageRepositoryWithCache } from './ImageRepositoryWithCache'
import * as Fixture from '../../__test__/testFactory'

class MapCache<T> implements ICache<T> {
  readonly store = new Map<string, T | null>()

  has(key: string): boolean {
    return this.store.has(key)
  }

  get(key: string): T | null | undefined {
    if (!this.store.has(key)) return undefined
    return this.store.get(key) as T | null
  }

  set(key: string, value: T | null): void {
    this.store.set(key, value)
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  invalidateByPrefix(prefix: string): number {
    let count = 0
    for (const key of [...this.store.keys()]) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
        count++
      }
    }
    return count
  }
}

describe('ImageRepositoryWithCache', () => {
  const setup = () => {
    const baseRepo = Fixture.imageRepositoryMock()
    const cache = new MapCache<ImageMetadataDTO>()
    const transactionContext = Fixture.transactionContextMock()
    const repository = new ImageRepositoryWithCache(baseRepo, cache, transactionContext)
    return { baseRepo, cache, repository }
  }

  it('loads findById from base on miss and serves cache on hit', async () => {
    const { baseRepo, repository } = setup()
    const metadata = Fixture.imageMetadataDTO()
    baseRepo.findById.mockResolvedValue(metadata)

    await expect(repository.findById(new ImageId(Fixture.sampleImageId))).resolves.toEqual(metadata)
    await expect(repository.findById(new ImageId(Fixture.sampleImageId))).resolves.toEqual(metadata)
    expect(baseRepo.findById).toHaveBeenCalledTimes(1)
  })

  it('loads findByIdAndVersionId from base on miss and serves cache on hit', async () => {
    const { baseRepo, repository } = setup()
    const metadata = Fixture.imageMetadataDTO()
    baseRepo.findByIdAndVersionId.mockResolvedValue(metadata)

    const imageId = new ImageId(Fixture.sampleImageId)
    const versionId = new ImageVersionId(Fixture.sampleImageVersionId)

    await expect(repository.findByIdAndVersionId(imageId, versionId)).resolves.toEqual(metadata)
    await expect(repository.findByIdAndVersionId(imageId, versionId)).resolves.toEqual(metadata)
    expect(baseRepo.findByIdAndVersionId).toHaveBeenCalledTimes(1)
  })

  it('negatively caches findById null misses', async () => {
    const { baseRepo, repository } = setup()
    baseRepo.findById.mockResolvedValue(null)

    await expect(repository.findById(new ImageId(Fixture.sampleImageId))).resolves.toBeNull()
    await expect(repository.findById(new ImageId(Fixture.sampleImageId))).resolves.toBeNull()
    expect(baseRepo.findById).toHaveBeenCalledTimes(1)
  })

  it('negatively caches findByIdAndVersionId null misses', async () => {
    const { baseRepo, repository } = setup()
    baseRepo.findByIdAndVersionId.mockResolvedValue(null)

    const imageId = new ImageId(Fixture.sampleImageId)
    const versionId = new ImageVersionId(Fixture.sampleImageVersionId)

    await expect(repository.findByIdAndVersionId(imageId, versionId)).resolves.toBeNull()
    await expect(repository.findByIdAndVersionId(imageId, versionId)).resolves.toBeNull()
    expect(baseRepo.findByIdAndVersionId).toHaveBeenCalledTimes(1)
  })

  it('passes through uncached findAllStorageKeys and findStagedStorageKeys', async () => {
    const { baseRepo, cache, repository } = setup()
    baseRepo.findAllStorageKeys.mockResolvedValue(['key-a'])
    baseRepo.findStagedStorageKeys.mockResolvedValue(['staged-key'])

    await expect(repository.findAllStorageKeys()).resolves.toEqual(['key-a'])
    await expect(repository.findStagedStorageKeys(new ImageId(Fixture.sampleImageId))).resolves.toEqual(['staged-key'])
    expect(cache.store.size).toBe(0)
  })

  it('invalidates version prefix on insertStaged', async () => {
    const { baseRepo, cache, repository } = setup()
    const staged = Fixture.stagedImageMock()
    cache.set(`findByIdAndVersionId:${Fixture.sampleImageId}:old`, Fixture.imageMetadataDTO())
    baseRepo.insertStaged.mockResolvedValue({ imageId: staged.imageId, stagedVersionId: staged.id })

    await repository.insertStaged(staged)

    expect(cache.has(`findByIdAndVersionId:${Fixture.sampleImageId}:old`)).toBe(false)
  })

  it('invalidates findById and version prefix on insertCurrent', async () => {
    const { baseRepo, cache, repository } = setup()
    const current = Fixture.currentImageMock()
    cache.set(`findById:${Fixture.sampleImageId}`, Fixture.imageMetadataDTO())
    cache.set(`findByIdAndVersionId:${Fixture.sampleImageId}:v1`, Fixture.imageMetadataDTO())
    baseRepo.insertCurrent.mockResolvedValue(Fixture.imageMetadataDTO())

    await repository.insertCurrent(current)

    expect(cache.has(`findById:${Fixture.sampleImageId}`)).toBe(false)
    expect(cache.has(`findByIdAndVersionId:${Fixture.sampleImageId}:v1`)).toBe(false)
  })

  it('invalidates cache keys on rollbackCurrentVersion', async () => {
    const { cache, repository } = setup()
    const current = Fixture.currentImageMock()
    cache.set(`findById:${Fixture.sampleImageId}`, Fixture.imageMetadataDTO())
    cache.set(`findByIdAndVersionId:${Fixture.sampleImageId}:v1`, Fixture.imageMetadataDTO())

    await repository.rollbackCurrentVersion(current)

    expect(cache.has(`findById:${Fixture.sampleImageId}`)).toBe(false)
    expect(cache.has(`findByIdAndVersionId:${Fixture.sampleImageId}:v1`)).toBe(false)
  })

  it('invalidates version prefix on pruneOldVersions', async () => {
    const { baseRepo, cache, repository } = setup()
    cache.set(`findByIdAndVersionId:${Fixture.sampleImageId}:old`, Fixture.imageMetadataDTO())
    baseRepo.pruneOldVersions.mockResolvedValue(['pruned-key'])

    await expect(repository.pruneOldVersions(Fixture.sampleImageId, 3)).resolves.toEqual(['pruned-key'])
    expect(cache.has(`findByIdAndVersionId:${Fixture.sampleImageId}:old`)).toBe(false)
  })

  it('invalidates cache keys on delete', async () => {
    const { baseRepo, cache, repository } = setup()
    const image = Fixture.imageMock()
    cache.set(`findById:${Fixture.sampleImageId}`, Fixture.imageMetadataDTO())
    cache.set(`findByIdAndVersionId:${Fixture.sampleImageId}:v1`, Fixture.imageMetadataDTO())
    baseRepo.delete.mockResolvedValue([Fixture.sampleImageStorageKey])

    await repository.delete(image)

    expect(cache.has(`findById:${Fixture.sampleImageId}`)).toBe(false)
    expect(cache.has(`findByIdAndVersionId:${Fixture.sampleImageId}:v1`)).toBe(false)
  })

  it('invalidates cache keys on savePromotedImage even inside an active transaction', async () => {
    const { baseRepo, cache } = setup()
    const transactionContext = Fixture.transactionContextMock()
    vi.mocked(transactionContext.getScope).mockReturnValue({ state: 'active' } as ITransactionScope)
    const repository = new ImageRepositoryWithCache(baseRepo, cache, transactionContext)

    cache.set(`findById:${Fixture.sampleImageId}`, Fixture.imageMetadataDTO())
    cache.set(`findByIdAndVersionId:${Fixture.sampleImageId}:v1`, Fixture.imageMetadataDTO())

    await repository.savePromotedImage(Fixture.imageMock())

    expect(cache.has(`findById:${Fixture.sampleImageId}`)).toBe(false)
    expect(cache.has(`findByIdAndVersionId:${Fixture.sampleImageId}:v1`)).toBe(false)
  })
})
