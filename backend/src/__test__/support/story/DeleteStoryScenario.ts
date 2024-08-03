import { StoryScenarioBase } from './StoryScenarioBase'
import { DeleteStoryUseCase } from '../../../application/useCases/story/DeleteStoryUseCase'
import { DeleteStoryInputDTO } from '@hatsuportal/post-management'

export class DeleteStoryScenario extends StoryScenarioBase<DeleteStoryInputDTO, 'storyDeleted' | 'deleteConflict'> {
  static given() {
    return new DeleteStoryScenario()
  }

  private constructor() {
    super(['storyDeleted', 'deleteConflict'])
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
        storyDeleted: this.spyOutputBoundary('storyDeleted'),
        deleteConflict: this.spyOutputBoundary('deleteConflict')
      })
    )
    return this
  }
}
