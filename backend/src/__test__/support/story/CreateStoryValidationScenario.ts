import { CreateStoryUseCaseWithValidation } from '../../../application/useCases/story/CreateStoryUseCase/CreateStoryUseCaseWithValidation'
import { vi } from 'vitest'
import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'
import { CreateStoryInputDTO, ICreateStoryUseCase } from '@hatsuportal/post-management'

export class CreateStoryValidationScenario extends StoryValidationScenarioBase<CreateStoryInputDTO, 'storyCreated'> {
  static given() {
    return new CreateStoryValidationScenario()
  }

  private constructor() {
    super(['storyCreated'])
  }

  private readonly innerUseCaseMock: ICreateStoryUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: CreateStoryInputDTO) {
    const wrapped = new CreateStoryUseCaseWithValidation(this.innerUseCaseMock, this.userRepository, this.authorizationService)

    await this.capture(() =>
      wrapped.execute({
        createStoryInput: input,
        storyCreated: this.spyOutputBoundary('storyCreated')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
