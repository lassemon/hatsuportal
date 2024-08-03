import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'
import { vi } from 'vitest'
import { SearchStoriesUseCaseWithValidation } from '../../../application/useCases/story/SearchStoriesUseCase/SearchStoriesUseCaseWithValidation'
import {
  ISearchStoriesUseCase,
  ISearchStoriesUseCaseOptions
} from '../../../application/useCases/story/SearchStoriesUseCase/SearchStoriesUseCase'

export class SearchStoriesValidationScenario extends StoryValidationScenarioBase<ISearchStoriesUseCaseOptions, 'foundStories'> {
  static given() {
    return new SearchStoriesValidationScenario()
  }

  private readonly innerUseCaseMock: ISearchStoriesUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  constructor() {
    super(['foundStories'])
  }

  async whenExecutedWithInput(input: ISearchStoriesUseCaseOptions) {
    const wrapped = new SearchStoriesUseCaseWithValidation(this.innerUseCaseMock, this.userGateway, this.authorizationService)

    await this.capture(() =>
      wrapped.execute({
        loggedInUserId: input.loggedInUserId,
        searchCriteria: input.searchCriteria,
        foundStories: this.spyOutputBoundary('foundStories')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
