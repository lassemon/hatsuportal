import { ScenarioBase } from './ScenarioBase'
import * as Fixture from '../testFactory'
import { vi, expect } from 'vitest'
import { ImageCreatedEvent, ImageDeletedEvent, ImageUpdatedEvent } from '../../domain/events/image/ImageEvents'
import { CurrentImage, IImageRepository, Image, StagedImage } from '../../domain'
import { ImageApplicationMapper } from '../../application/mappers/ImageApplicationMapper'
import { StorageKeyGenerator } from '../../infrastructure'

export const ImageDomainEvents = {
  ImageCreatedEvent,
  ImageUpdatedEvent,
  ImageDeletedEvent
}

export abstract class ImageScenarioBase<INPUT, CALLBACKS extends string> extends ScenarioBase<INPUT, CALLBACKS, typeof ImageDomainEvents> {
  protected readonly imageRepository = Fixture.imageRepositoryMock()
  protected readonly imageMapper = new ImageApplicationMapper()
  protected readonly storageKeyGenerator = new StorageKeyGenerator()

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames, ImageDomainEvents)
    this.imageRepository.findById = vi.fn().mockResolvedValue(Fixture.imageMock())
    this.imageRepository.findByIdAndVersionId = vi.fn().mockResolvedValue(Fixture.imageMock())
    this.imageRepository.insertStaged = vi
      .fn()
      .mockImplementation((image: StagedImage) => ({ imageId: image.imageId, stagedVersionId: image.id }))
    this.imageRepository.insertCurrent = vi.fn().mockImplementation((image: CurrentImage) => {
      const imageMock = Fixture.imageMock({
        id: image.id,
        createdAt: image.createdAt,
        createdById: image.createdById,
        updatedAt: image.updatedAt
      })
      imageMock.addDomainEvent(new ImageCreatedEvent(imageMock))
      return imageMock
    })
    this.imageRepository.update = vi.fn().mockImplementation((image: CurrentImage) => {
      const imageMock = Fixture.imageMock({
        id: image.id,
        createdAt: image.createdAt,
        createdById: image.createdById,
        currentVersionId: image.currentVersionId,
        updatedAt: image.updatedAt
      })
      imageMock.addDomainEvent(new ImageUpdatedEvent(imageMock, imageMock))
      return imageMock
    })
    this.imageRepository.discardStagedVersion = vi.fn().mockImplementation((image: CurrentImage) => {})
    this.imageRepository.delete = vi.fn().mockImplementation((image: Image) => image)
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  withExistingImage(image = Fixture.imageMock()) {
    this.imageRepository.findById = vi.fn().mockResolvedValue(image)
    this.imageRepository.findByIdAndVersionId = vi.fn().mockResolvedValue(image)
    this.imageRepository.insertStaged = vi.fn().mockResolvedValue(image)
    this.imageRepository.insertCurrent = vi.fn().mockResolvedValue(image)
    this.imageRepository.update = vi.fn().mockResolvedValue(image)
    this.imageRepository.discardStagedVersion = vi.fn().mockResolvedValue(image)
    this.imageRepository.delete = vi.fn().mockResolvedValue(image)
    return this
  }

  withoutExistingImage() {
    this.imageRepository.findById = vi.fn().mockResolvedValue(null)
    this.imageRepository.findByIdAndVersionId = vi.fn().mockResolvedValue(null)
    this.imageRepository.insertStaged = vi.fn().mockResolvedValue(null)
    this.imageRepository.insertCurrent = vi.fn().mockResolvedValue(null)
    this.imageRepository.update = vi.fn().mockResolvedValue(null)
    this.imageRepository.discardStagedVersion = vi.fn().mockResolvedValue(null)
    this.imageRepository.delete = vi.fn().mockResolvedValue(null)
    return this
  }

  repositoryWillReject(methods: (keyof IImageRepository)[], error: Error = new Error('Repository failure')) {
    methods.forEach((method) => {
      // @ts-expect-error – the mock infra object definitely has this key
      this.imageRepository[method] = vi.fn().mockRejectedValue(error)
    })
    return this
  }

  thenRepositoryCalledTimes(method: keyof IImageRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.imageRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
