import { vi } from 'vitest'
import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'
import {
  DeleteStoryUseCaseWithValidation,
  IDeleteStoryUseCase,
  IDeleteStoryUseCaseOptions
} from '../../../application/useCases/story/DeleteStoryUseCase'

export class DeletestoryValidationScenario extends StoryValidationScenarioBase<
  IDeleteStoryUseCaseOptions,
  'storyDeleted' | 'deleteConflict'
> {
  static given() {
    return new DeletestoryValidationScenario()
  }

  private constructor() {
    super(['storyDeleted', 'deleteConflict'])
  }

  private readonly innerUseCaseMock: IDeleteStoryUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: IDeleteStoryUseCaseOptions) {
    const wrapped = new DeleteStoryUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.storyWriteRepository,
      this.storyMapper,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        deletedById: input.deletedById,
        deleteStoryInput: input.deleteStoryInput,
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
