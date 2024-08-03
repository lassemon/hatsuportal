import { StoryScenarioBase } from './StoryScenarioBase'
import {
  FindMyStoriesUseCase,
  IFindMyStoriesUseCaseOptions
} from '../../../application/useCases/story/FindMyStoriesUseCase/FindMyStoriesUseCase'

export class FindMyStoriesScenario extends StoryScenarioBase<IFindMyStoriesUseCaseOptions, 'storiesFound'> {
  static given() {
    return new FindMyStoriesScenario()
  }

  private constructor() {
    super(['storiesFound'])
  }

  async whenExecutedWithInput(input: IFindMyStoriesUseCaseOptions) {
    const useCase = new FindMyStoriesUseCase(this.storyLookupService)

    await this.capture(() =>
      useCase.execute({
        loggedInUserId: input.loggedInUserId!,
        storiesFound: this.spyOutputBoundary('storiesFound')
      })
    )

    return this
  }
}
