import { StoryScenarioBase } from './StoryScenarioBase'
import { SearchStoriesUseCase } from '../../../application/useCases/story/SearchStoriesUseCase/SearchStoriesUseCase'
import { ISearchStoriesUseCaseOptions } from '../../../application/useCases/story/SearchStoriesUseCase/SearchStoriesUseCase'

export class SearchStoriesScenario extends StoryScenarioBase<ISearchStoriesUseCaseOptions, 'foundStories'> {
  static given() {
    return new SearchStoriesScenario()
  }

  constructor() {
    super(['foundStories'])
  }

  async whenExecutedWithInput(input: ISearchStoriesUseCaseOptions) {
    const useCase = new SearchStoriesUseCase(this.storyLookupService, this.userGateway)

    await this.capture(() =>
      useCase.execute({
        loggedInUserId: input.loggedInUserId,
        searchCriteria: input.searchCriteria,
        foundStories: this.spyOutputBoundary('foundStories')
      })
    )

    return this
  }
}
