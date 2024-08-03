import { IUpdateStoryUseCase, UpdateStoryInputDTO } from '@hatsuportal/post-management'
import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'
import { UpdateStoryUseCaseWithValidation } from '../../../application/useCases/story/UpdateStoryUseCase/UpdateStoryUseCaseWithValidation'
import { vi } from 'vitest'

export class UpdateStoryValidationScenario extends StoryValidationScenarioBase<UpdateStoryInputDTO, 'storyUpdated' | 'updateConflict'> {
  static given() {
    return new UpdateStoryValidationScenario()
  }

  private readonly innerUseCaseMock: IUpdateStoryUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  constructor() {
    super(['storyUpdated', 'updateConflict'])
  }

  async whenExecutedWithInput(input: UpdateStoryInputDTO) {
    const wrapped = new UpdateStoryUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userRepository,
      this.storyRepository,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        updateStoryInput: input,
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
