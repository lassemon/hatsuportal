import { CreateStoryUseCaseWithValidation } from '../../../application/useCases/story/CreateStoryUseCase/CreateStoryUseCaseWithValidation'
import { vi } from 'vitest'
import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'
import { ICreateStoryUseCase, ICreateStoryUseCaseOptions } from '../../../application'

export class CreateStoryValidationScenario extends StoryValidationScenarioBase<ICreateStoryUseCaseOptions, 'storyCreated'> {
  static given() {
    return new CreateStoryValidationScenario()
  }

  private constructor() {
    super(['storyCreated'])
  }

  private readonly innerUseCaseMock: ICreateStoryUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: ICreateStoryUseCaseOptions) {
    const wrapped = new CreateStoryUseCaseWithValidation(this.innerUseCaseMock, this.userGateway, this.authorizationService)

    await this.capture(() =>
      wrapped.execute({
        createdById: input.createdById,
        createStoryInput: input.createStoryInput,
        storyCreated: this.spyOutputBoundary('storyCreated')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
