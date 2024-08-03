import { StoryScenarioBase } from './StoryScenarioBase'
import { RemoveImageFromStoryUseCase } from '../../../application/useCases/story/RemoveImageFromStoryUseCase/RemoveImageFromStoryUseCase'
import { RemoveImageFromStoryInputDTO } from '@hatsuportal/post-management'

export class RemoveImageFromStoryScenario extends StoryScenarioBase<RemoveImageFromStoryInputDTO, 'imageRemoved'> {
  static given() {
    return new RemoveImageFromStoryScenario()
  }

  private constructor() {
    super(['imageRemoved'])
  }

  async whenExecutedWithInput(input: RemoveImageFromStoryInputDTO) {
    const useCase = new RemoveImageFromStoryUseCase(
      this.storyRepository,
      this.imageRepository,
      this.storyMapper,
      this.transactionBundle.transactionManagerMock
    )

    await this.capture(() =>
      useCase.execute({
        removeImageFromStoryInput: input,
        imageRemoved: this.spyOutputBoundary('imageRemoved')
      })
    )
    return this
  }
}
