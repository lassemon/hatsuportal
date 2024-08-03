import { expect, Mocked, vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { StoryScenarioBase } from './StoryScenarioBase'
import { SearchStoriesUseCase } from '../../../application/useCases/story/SearchStoriesUseCase/SearchStoriesUseCase'
import { ISearchStoriesUseCaseOptions } from '../../../application/useCases/story/SearchStoriesUseCase/SearchStoriesUseCase'
import { IStoryListSearchService } from '../../../application/services/story/StoryListSearchService'

export class SearchStoriesScenario extends StoryScenarioBase<ISearchStoriesUseCaseOptions, 'foundStories'> {
  protected readonly storyListSearchService: Mocked<IStoryListSearchService>

  static given() {
    return new SearchStoriesScenario()
  }

  constructor() {
    super(['foundStories'])
    this.storyListSearchService = Fixture.storyListSearchServiceMock()
  }

  listSearchServiceWillReject(error: Error = new Error('StoryListSearchService failure')) {
    this.storyListSearchService.search = vi.fn().mockRejectedValue(error)
    return this
  }

  async whenExecutedWithInput(input: ISearchStoriesUseCaseOptions) {
    const useCase = new SearchStoriesUseCase(this.storyListSearchService)

    await this.capture(() =>
      useCase.execute({
        loggedInUserId: input.loggedInUserId,
        searchCriteria: input.searchCriteria,
        foundStories: this.spyOutputBoundary('foundStories')
      })
    )

    return this
  }

  thenStoryListSearchServiceCalledTimes(method: keyof IStoryListSearchService, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.storyListSearchService[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
