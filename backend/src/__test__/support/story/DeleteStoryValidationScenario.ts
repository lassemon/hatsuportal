import { DeleteStoryUseCaseWithValidation } from '../../../application/useCases/story/DeleteStoryUseCase'
import { vi } from 'vitest'
import { IDeleteStoryUseCase, DeleteStoryInputDTO } from '@hatsuportal/post-management'
import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'

export class DeletestoryValidationScenario extends StoryValidationScenarioBase<DeleteStoryInputDTO, 'storyDeleted' | 'deleteConflict'> {
  static given() {
    return new DeletestoryValidationScenario()
  }

  private constructor() {
    super(['storyDeleted', 'deleteConflict'])
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
        storyDeleted: this.spyOutputBoundary('storyDeleted'),
        deleteConflict: this.spyOutputBoundary('deleteConflict')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
