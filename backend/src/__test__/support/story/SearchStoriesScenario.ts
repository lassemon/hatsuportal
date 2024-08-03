import { StoryScenarioBase } from './StoryScenarioBase'
import { SearchStoriesInputDTO } from '@hatsuportal/post-management'
import { SearchStoriesUseCase } from '../../../application/useCases/story/SearchStoriesUseCase/SearchStoriesUseCase'

export class SearchStoriesScenario extends StoryScenarioBase<SearchStoriesInputDTO, 'foundStories'> {
  static given() {
    return new SearchStoriesScenario()
  }

  constructor() {
    super(['foundStories'])
  }

  async whenExecutedWithInput(input: SearchStoriesInputDTO) {
    const useCase = new SearchStoriesUseCase(this.storyRepository, this.userRepository, this.storyMapper)

    await this.capture(() =>
      useCase.execute({
        searchStoriesInput: input,
        foundStories: this.spyOutputBoundary('foundStories')
      })
    )

    return this
  }
}
