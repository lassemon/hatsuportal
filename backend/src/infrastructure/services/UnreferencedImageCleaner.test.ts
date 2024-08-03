import { describe, expect, it, vi } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import { DeleteImageUseCase, IImageRepository } from '@hatsuportal/media-management'
import { IStoryReadRepository } from '@hatsuportal/post-management'
import { SystemUserId } from '@hatsuportal/user-management'
import { UnreferencedImageCleaner } from './UnreferencedImageCleaner'

describe('UnreferencedImageCleaner', () => {
  const setup = () => {
    const imageRepository = {
      findAllCleanupCandidates: vi.fn().mockResolvedValue([
        { id: 'image-a', updatedAt: 0 },
        { id: 'image-b', updatedAt: 0 },
        { id: 'image-c', updatedAt: Date.now() }
      ])
    } as unknown as IImageRepository
    const storyReadRepository = {
      findAllReferencedCoverImageIds: vi.fn().mockResolvedValue(['image-b'])
    } as unknown as IStoryReadRepository
    const deleteImageUseCase = {
      execute: vi.fn().mockResolvedValue(undefined)
    } as unknown as DeleteImageUseCase
    const cleanupLock = {
      tryAcquire: vi.fn().mockResolvedValue(true),
      release: vi.fn().mockResolvedValue(undefined)
    }

    const cleaner = new UnreferencedImageCleaner(
      imageRepository,
      storyReadRepository,
      deleteImageUseCase,
      SystemUserId.default(),
      10 * 60 * 1000,
      cleanupLock
    )

    return { imageRepository, storyReadRepository, deleteImageUseCase, cleanupLock, cleaner }
  }

  it('deletes images that are old enough and not referenced by any story cover link', async () => {
    const { deleteImageUseCase, cleaner } = setup()
    const execute = vi.mocked(deleteImageUseCase.execute)

    await cleaner.cleanUnreferencedImages()

    expect(execute).toHaveBeenCalledTimes(1)
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        deletedById: SystemUserId.DEFAULT,
        deleteImageInput: { imageId: 'image-a' }
      })
    )
  })

  it('skips cleanup when the advisory lock is unavailable', async () => {
    const { deleteImageUseCase, cleanupLock, cleaner } = setup()
    const execute = vi.mocked(deleteImageUseCase.execute)
    cleanupLock.tryAcquire.mockResolvedValue(false)

    await cleaner.cleanUnreferencedImages()

    expect(execute).not.toHaveBeenCalled()
    expect(cleanupLock.release).not.toHaveBeenCalled()
  })

  it('continues when delete reports the image is already gone', async () => {
    const { deleteImageUseCase, cleaner } = setup()
    vi.mocked(deleteImageUseCase.execute).mockRejectedValue(new NotFoundError('Image not found'))

    await expect(cleaner.cleanUnreferencedImages()).resolves.toBeUndefined()
  })
})
