import { StoryScenarioBase } from './StoryScenarioBase'
import { DeleteStoryUseCase, IDeleteStoryUseCaseOptions } from '../../../application/useCases/story/DeleteStoryUseCase/DeleteStoryUseCase'

export class DeleteStoryScenario extends StoryScenarioBase<IDeleteStoryUseCaseOptions, 'storyDeleted' | 'deleteConflict'> {
  static given() {
    return new DeleteStoryScenario()
  }

  private constructor() {
    super(['storyDeleted', 'deleteConflict'])
  }

  async whenExecutedWithInput(input: IDeleteStoryUseCaseOptions) {
    const useCase = new DeleteStoryUseCase(
      this.storyWriteRepository,
      this.storyReadRepository,
      this.storyMapper,
      this.storyCoverImageCleanupService,
      this.unitOfWork
    )

    await this.capture(() =>
      useCase.execute({
        deletedById: input.deletedById,
        deleteStoryInput: input.deleteStoryInput,
        storyDeleted: this.spyOutputBoundary('storyDeleted'),
        deleteConflict: this.spyOutputBoundary('deleteConflict')
      })
    )
    return this
  }
}
