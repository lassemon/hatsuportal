import { IRemoveImageFromStoryUseCase, RemoveImageFromStoryInputDTO } from '@hatsuportal/post-management'
import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'
import { vi } from 'vitest'
import { RemoveImageFromStoryUseCaseWithValidation } from '../../../application/useCases/story/RemoveImageFromStoryUseCase/RemoveImageFromStoryUseCaseWithValidation'

export class RemoveImageFromStoryValidationScenario extends StoryValidationScenarioBase<RemoveImageFromStoryInputDTO, 'imageRemoved'> {
  static given() {
    return new RemoveImageFromStoryValidationScenario()
  }

  private readonly innerUseCaseMock: IRemoveImageFromStoryUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  private constructor() {
    super(['imageRemoved'])
  }

  async whenExecutedWithInput(input: RemoveImageFromStoryInputDTO) {
    const wrapped = new RemoveImageFromStoryUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userRepository,
      this.storyRepository,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        removeImageFromStoryInput: input,
        imageRemoved: this.spyOutputBoundary('imageRemoved')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
