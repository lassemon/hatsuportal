import { IUpdateStoryUseCaseOptions, UpdateStoryUseCase } from '../../../application/useCases/story/UpdateStoryUseCase/UpdateStoryUseCase'
import { StoryScenarioBase } from './StoryScenarioBase'

export class UpdateStoryScenario extends StoryScenarioBase<IUpdateStoryUseCaseOptions, 'storyUpdated' | 'updateConflict'> {
  static given() {
    return new UpdateStoryScenario()
  }

  private constructor() {
    super(['storyUpdated', 'updateConflict'])
  }

  async whenExecutedWithInput(input: IUpdateStoryUseCaseOptions) {
    const useCase = new UpdateStoryUseCase(
      this.mediaGateway,
      this.storyWriteRepository,
      this.storyLookupService,
      this.tagRepository,
      this.transactionManager
    )

    await this.capture(() =>
      useCase.execute({
        updatedById: input.updatedById,
        updateStoryInput: input.updateStoryInput,
        storyUpdated: this.spyOutputBoundary('storyUpdated'),
        updateConflict: this.spyOutputBoundary('updateConflict')
      })
    )
    return this
  }
}
