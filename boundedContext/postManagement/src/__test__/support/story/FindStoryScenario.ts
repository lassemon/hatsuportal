import { StoryScenarioBase } from './StoryScenarioBase'
import { FindStoryUseCase, IFindStoryUseCaseOptions } from '../../../application/useCases/story/FindStoryUseCase/FindStoryUseCase'

export class FindStoryScenario extends StoryScenarioBase<IFindStoryUseCaseOptions, 'storyFound'> {
  static given() {
    return new FindStoryScenario()
  }

  constructor() {
    super(['storyFound'])
  }

  async whenExecutedWithInput(input: IFindStoryUseCaseOptions) {
    const useCase = new FindStoryUseCase(this.storyLookupService)

    await this.capture(() =>
      useCase.execute({
        loggedInUserId: input.loggedInUserId,
        findStoryInput: input.findStoryInput,
        storyFound: this.spyOutputBoundary('storyFound')
      })
    )

    return this
  }
}
