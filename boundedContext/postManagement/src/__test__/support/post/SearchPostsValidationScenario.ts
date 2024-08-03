import { vi } from 'vitest'
import { StoryValidationScenarioBase } from '../story/StoryValidationScenarioBase'
import { SearchPostsUseCaseWithValidation } from '../../../application/useCases/post/SearchPostsUseCase/SearchPostsUseCaseWithValidation'
import { ISearchPostsUseCase, ISearchPostsUseCaseOptions } from '../../../application/useCases/post/SearchPostsUseCase/SearchPostsUseCase'
import { PostApplicationMapper } from '../../../application/mappers/PostApplicationMapper'

export class SearchPostsValidationScenario extends StoryValidationScenarioBase<ISearchPostsUseCaseOptions, 'foundPosts'> {
  static given() {
    return new SearchPostsValidationScenario()
  }

  private readonly innerUseCaseMock: ISearchPostsUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  private readonly postApplicationMapper = new PostApplicationMapper()

  constructor() {
    super(['foundPosts'])
  }

  async whenExecutedWithInput(input: ISearchPostsUseCaseOptions) {
    const wrapped = new SearchPostsUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.postApplicationMapper,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        loggedInUserId: input.loggedInUserId,
        searchCriteria: input.searchCriteria,
        foundPosts: this.spyOutputBoundary('foundPosts')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
