import { DeleteStoryInputDTO, IDeleteStoryUseCase } from '@hatsuportal/post-management'
import { DeleteStoryUseCaseWithValidation } from '../../../useCases/story/DeleteStoryUseCase'
import { vi } from 'vitest'
import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'

export class DeletestoryValidationScenario extends StoryValidationScenarioBase<DeleteStoryInputDTO, 'storyDeleted'> {
  static given() {
    return new DeletestoryValidationScenario()
  }

  private constructor() {
    super(['storyDeleted'])
  }

  private readonly innerUseCaseMock: IDeleteStoryUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: DeleteStoryInputDTO) {
    const wrapped = new DeleteStoryUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userRepository,
      this.storyRepository,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        deleteStoryInput: input,
        storyDeleted: this.spyOutputBoundary('storyDeleted')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
