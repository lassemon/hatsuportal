import { DeleteStoryInputDTO } from '@hatsuportal/post-management'
import { StoryScenarioBase } from './StoryScenarioBase'
import { DeleteStoryUseCase } from '../../../useCases/story/DeleteStoryUseCase'

export class DeleteStoryScenario extends StoryScenarioBase<DeleteStoryInputDTO, 'storyDeleted'> {
  static given() {
    return new DeleteStoryScenario()
  }

  private constructor() {
    super(['storyDeleted'])
  }

  async whenExecutedWithInput(input: DeleteStoryInputDTO) {
    const useCase = new DeleteStoryUseCase(
      this.imageRepository,
      this.storyRepository,
      this.storyMapper,
      this.transactionBundle.transactionManagerMock
    )

    await this.capture(() =>
      useCase.execute({
        deleteStoryInput: input,
        storyDeleted: this.spyOutputBoundary('storyDeleted')
      })
    )
    return this
  }
}
