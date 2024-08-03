import { StoryScenarioBase } from './StoryScenarioBase'
import { FindMyStoriesUseCase } from '../../../application/useCases/story/FindMyStoriesUseCase/FindMyStoriesUseCase'
import { FindStoryInputDTO } from '@hatsuportal/post-management'

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
