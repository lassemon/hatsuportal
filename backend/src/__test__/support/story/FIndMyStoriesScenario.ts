import { FindStoryInputDTO } from '@hatsuportal/post-management'
import { StoryScenarioBase } from './StoryScenarioBase'
import { FindMyStoriesUseCase } from '../../../useCases/story/FindMyStoriesUseCase/FindMyStoriesUseCase'

export class FindMyStoriesScenario extends StoryScenarioBase<FindStoryInputDTO, 'storiesFound'> {
  static given() {
    return new FindMyStoriesScenario()
  }

  private constructor() {
    super(['storiesFound'])
  }

  async whenExecutedWithInput(input: FindStoryInputDTO) {
    const useCase = new FindMyStoriesUseCase(this.storyRepository, this.storyMapper)

    await this.capture(() =>
      useCase.execute({
        loggedInUserId: input.loggedInUserId!,
        storiesFound: this.spyOutputBoundary('storiesFound')
      })
    )

    return this
  }
}
