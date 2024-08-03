import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'
import { UpdateStoryUseCaseWithValidation } from '../../../application/useCases/story/UpdateStoryUseCase/UpdateStoryUseCaseWithValidation'
import { vi } from 'vitest'
import { IUpdateStoryUseCase, IUpdateStoryUseCaseOptions } from '../../../application/useCases/story/UpdateStoryUseCase/UpdateStoryUseCase'

export class UpdateStoryValidationScenario extends StoryValidationScenarioBase<
  IUpdateStoryUseCaseOptions,
  'storyUpdated' | 'updateConflict'
> {
  static given() {
    return new UpdateStoryValidationScenario()
  }

  private readonly innerUseCaseMock: IUpdateStoryUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  constructor() {
    super(['storyUpdated', 'updateConflict'])
  }

  async whenExecutedWithInput(input: IUpdateStoryUseCaseOptions) {
    const wrapped = new UpdateStoryUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.storyWriteRepository,
      this.storyMapper,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        updatedById: input.updatedById,
        updateStoryInput: input.updateStoryInput,
        storyUpdated: this.spyOutputBoundary('storyUpdated'),
        updateConflict: this.spyOutputBoundary('updateConflict')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
