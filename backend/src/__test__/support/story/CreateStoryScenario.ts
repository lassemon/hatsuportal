import { StoryScenarioBase } from './StoryScenarioBase'
import { CreateStoryUseCase } from '../../../application/useCases/story/CreateStoryUseCase/CreateStoryUseCase'
import { CreateStoryInputDTO } from '@hatsuportal/post-management'

export class CreateStoryScenario extends StoryScenarioBase<CreateStoryInputDTO, 'storyCreated'> {
  static given() {
    return new CreateStoryScenario()
  }

  private constructor() {
    super(['storyCreated'])
  }

  async whenExecutedWithInput(input: CreateStoryInputDTO) {
    const useCase = new CreateStoryUseCase(
      this.userRepository,
      this.imageRepository,
      this.storyRepository,
      this.storyMapper,
      this.transactionBundle.transactionManagerMock
    )

    await this.capture(() =>
      useCase.execute({
        createStoryInput: input,
        storyCreated: this.spyOutputBoundary('storyCreated')
      })
    )
    return this
  }
}
