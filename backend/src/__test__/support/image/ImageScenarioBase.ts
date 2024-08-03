import { ScenarioBase } from '../ScenarioBase'
import * as Fixture from '../../testFactory'
import { vi, expect } from 'vitest'
import {
  ImageCreatedEvent,
  ImageUpdatedEvent,
  ImageDeletedEvent,
  IImageRepository,
  ImageApplicationMapper,
  ImageFactory
} from '@hatsuportal/common-bounded-context'

export const ImageDomainEvents = {
  ImageCreatedEvent,
  ImageUpdatedEvent,
  ImageDeletedEvent
}

export abstract class ImageScenarioBase<INPUT, CALLBACKS extends string> extends ScenarioBase<INPUT, CALLBACKS, typeof ImageDomainEvents> {
  protected readonly imageRepository = Fixture.imageRepositoryMock()
  protected readonly imageMapper = new ImageApplicationMapper(new ImageFactory())

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames, ImageDomainEvents)
    this.imageRepository.insert = vi.fn().mockImplementation((image) => image)
    this.imageRepository.update = vi.fn().mockImplementation((image) => image)
    this.imageRepository.delete = vi.fn().mockImplementation((image) => image)
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  withExistingImage(image = Fixture.imageMock()) {
    this.imageRepository.findById = vi.fn().mockResolvedValue(image)
    return this
  }

  withoutExistingImage() {
    this.imageRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  repositoryWillReject(method: keyof IImageRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.imageRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  thenRepositoryCalledTimes(method: keyof IImageRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.imageRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
