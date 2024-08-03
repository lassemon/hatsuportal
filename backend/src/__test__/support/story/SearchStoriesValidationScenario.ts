import { ISearchStoriesUseCase, SearchStoriesInputDTO } from '@hatsuportal/post-management'
import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'
import { vi } from 'vitest'
import { SearchStoriesUseCaseWithValidation } from '../../../application/useCases/story/SearchStoriesUseCase/SearchStoriesUseCaseWithValidation'

export class SearchStoriesValidationScenario extends StoryValidationScenarioBase<SearchStoriesInputDTO, 'foundStories'> {
  static given() {
    return new SearchStoriesValidationScenario()
  }

  private readonly innerUseCaseMock: ISearchStoriesUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  constructor() {
    super(['foundStories'])
  }

  async whenExecutedWithInput(input: SearchStoriesInputDTO) {
    const wrapped = new SearchStoriesUseCaseWithValidation(this.innerUseCaseMock, this.userRepository, this.authorizationService)

    await this.capture(() =>
      wrapped.execute({
        searchStoriesInput: input,
        foundStories: this.spyOutputBoundary('foundStories')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
