import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'
import { FindStoryUseCaseWithValidation } from '../../../application/useCases/story/FindStoryUseCase/FindStoryUseCaseWithValidation'
import { vi } from 'vitest'
import { IFindStoryUseCase, IFindStoryUseCaseOptions } from '../../../application/useCases/story/FindStoryUseCase'

export class FindStoryValidationScenario extends StoryValidationScenarioBase<IFindStoryUseCaseOptions, 'storyFound'> {
  static given() {
    return new FindStoryValidationScenario()
  }

  private readonly innerUseCaseMock: IFindStoryUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  constructor() {
    super(['storyFound'])
  }

  async whenExecutedWithInput(input: IFindStoryUseCaseOptions) {
    const wrapped = new FindStoryUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.storyReadRepository,
      this.authorizationService
    )
    await this.capture(() =>
      wrapped.execute({
        loggedInUserId: input.loggedInUserId,
        findStoryInput: input.findStoryInput,
        storyFound: this.spyOutputBoundary('storyFound')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
