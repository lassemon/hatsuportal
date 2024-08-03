import {
  IRemoveImageFromStoryUseCase,
  IRemoveImageFromStoryUseCaseOptions,
  RemoveImageFromStoryUseCaseWithValidation
} from '../../../application/useCases/story/RemoveCoverImageFromStoryUseCase'
import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'
import { vi } from 'vitest'

export class RemoveImageFromStoryValidationScenario extends StoryValidationScenarioBase<
  IRemoveImageFromStoryUseCaseOptions,
  'imageRemoved'
> {
  static given() {
    return new RemoveImageFromStoryValidationScenario()
  }

  private readonly innerUseCaseMock: IRemoveImageFromStoryUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  private constructor() {
    super(['imageRemoved'])
  }

  async whenExecutedWithInput(input: IRemoveImageFromStoryUseCaseOptions) {
    const wrapped = new RemoveImageFromStoryUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.storyWriteRepository,
      this.storyMapper,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        removedById: input.removedById,
        removeImageFromStoryInput: input.removeImageFromStoryInput,
        imageRemoved: this.spyOutputBoundary('imageRemoved')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
