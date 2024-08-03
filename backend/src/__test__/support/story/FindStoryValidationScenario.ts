import { IFindStoryUseCase, FindStoryInputDTO } from '@hatsuportal/post-management'
import { StoryValidationScenarioBase } from './StoryValidationScenarioBase'
import { FindStoryUseCaseWithValidation } from '../../../application/useCases/story/FindStoryUseCase/FindStoryUseCaseWithValidation'
import { vi } from 'vitest'

export class FindStoryValidationScenario extends StoryValidationScenarioBase<FindStoryInputDTO, 'storyFound'> {
  static given() {
    return new FindStoryValidationScenario()
  }

  private readonly innerUseCaseMock: IFindStoryUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  constructor() {
    super(['storyFound'])
  }

  async whenExecutedWithInput(input: FindStoryInputDTO) {
    const wrapped = new FindStoryUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userRepository,
      this.storyRepository,
      this.authorizationService
    )
    await this.capture(() =>
      wrapped.execute({
        findStoryInput: input,
        storyFound: this.spyOutputBoundary('storyFound')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
