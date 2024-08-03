import { StoryScenarioBase } from './StoryScenarioBase'
import { FindStoryUseCase } from '../../../application/useCases/story/FindStoryUseCase/FindStoryUseCase'
import { FindStoryInputDTO } from '@hatsuportal/post-management'

export class FindStoryScenario extends StoryScenarioBase<FindStoryInputDTO, 'storyFound'> {
  static given() {
    return new FindStoryScenario()
  }

  constructor() {
    super(['storyFound'])
  }

  async whenExecutedWithInput(input: FindStoryInputDTO) {
    const useCase = new FindStoryUseCase(this.storyRepository, this.storyMapper)

    await this.capture(() =>
      useCase.execute({
        findStoryInput: input,
        storyFound: this.spyOutputBoundary('storyFound')
      })
    )

    return this
  }
}
