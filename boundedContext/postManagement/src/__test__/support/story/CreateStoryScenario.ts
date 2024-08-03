import { ICreateStoryUseCaseOptions } from '../../../application'
import { CreateStoryUseCase } from '../../../application/useCases/story/CreateStoryUseCase'
import { StoryScenarioBase } from './StoryScenarioBase'

export class CreateStoryScenario extends StoryScenarioBase<ICreateStoryUseCaseOptions, 'storyCreated'> {
  static given() {
    return new CreateStoryScenario()
  }

  private constructor() {
    super(['storyCreated'])
  }

  async whenExecutedWithInput(input: ICreateStoryUseCaseOptions) {
    const useCase = new CreateStoryUseCase(
      this.userGateway,
      this.mediaGateway,
      this.storyWriteRepository,
      this.storyLookupService,
      this.transactionManager
    )

    await this.capture(() =>
      useCase.execute({
        createdById: input.createdById,
        createStoryInput: input.createStoryInput,
        storyCreated: this.spyOutputBoundary('storyCreated')
      })
    )
    return this
  }
}
