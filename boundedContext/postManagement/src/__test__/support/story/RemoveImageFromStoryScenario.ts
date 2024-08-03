import {
  IRemoveImageFromStoryUseCaseOptions,
  RemoveImageFromStoryUseCase
} from '../../../application/useCases/story/RemoveCoverImageFromStoryUseCase'
import { StoryScenarioBase } from './StoryScenarioBase'
export class RemoveImageFromStoryScenario extends StoryScenarioBase<IRemoveImageFromStoryUseCaseOptions, 'imageRemoved'> {
  static given() {
    return new RemoveImageFromStoryScenario()
  }

  private constructor() {
    super(['imageRemoved'])
  }

  async whenExecutedWithInput(input: IRemoveImageFromStoryUseCaseOptions) {
    const useCase = new RemoveImageFromStoryUseCase(
      this.storyWriteRepository,
      this.mediaGateway,
      this.storyLookupService,
      this.transactionManager
    )

    await this.capture(() =>
      useCase.execute({
        removedById: input.removedById,
        removeImageFromStoryInput: input.removeImageFromStoryInput,
        imageRemoved: this.spyOutputBoundary('imageRemoved')
      })
    )
    return this
  }
}
