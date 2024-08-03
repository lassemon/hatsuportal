import { StoryScenarioBase } from './StoryScenarioBase'
import { UpdateStoryInputDTO } from '@hatsuportal/post-management'
import { UpdateStoryUseCase } from '../../../useCases/story/UpdateStoryUseCase'

export class UpdateStoryScenario extends StoryScenarioBase<UpdateStoryInputDTO, 'storyUpdated' | 'updateConflict'> {
  static given() {
    return new UpdateStoryScenario()
  }

  private constructor() {
    super(['storyUpdated', 'updateConflict'])
  }

  async whenExecutedWithInput(input: UpdateStoryInputDTO) {
    const useCase = new UpdateStoryUseCase(
      this.imageRepository,
      this.storyRepository,
      this.storyMapper,
      this.transactionBundle.transactionManagerMock
    )

    await this.capture(() =>
      useCase.execute({
        updateStoryInput: input,
        storyUpdated: this.spyOutputBoundary('storyUpdated'),
        updateConflict: this.spyOutputBoundary('updateConflict')
      })
    )
    return this
  }
}
