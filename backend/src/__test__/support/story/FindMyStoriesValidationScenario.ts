import { FindStoryInputDTO, IFindMyStoriesUseCase } from '@hatsuportal/post-management'
import { FindMyStoriesUseCaseWithValidation } from '../../../useCases/story/FindMyStoriesUseCase'
import { vi } from 'vitest'
import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'

export class FindMyStoriesValidationScenario extends StoryValidationScenarioBase<FindStoryInputDTO, 'storiesFound'> {
  static given() {
    return new FindMyStoriesValidationScenario()
  }

  private readonly innerUseCaseMock: IFindMyStoriesUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  private constructor() {
    super(['storiesFound'])
  }

  async whenExecutedWithInput(input: FindStoryInputDTO) {
    const wrapped = new FindMyStoriesUseCaseWithValidation(this.innerUseCaseMock, this.userRepository)

    await this.capture(() =>
      wrapped.execute({
        loggedInUserId: input.loggedInUserId!,
        storiesFound: this.spyOutputBoundary('storiesFound')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
