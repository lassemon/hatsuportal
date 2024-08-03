import { expect, Mocked, vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { ScenarioBase } from '../ScenarioBase'
import { SearchPostsUseCase } from '../../../application/useCases/post/SearchPostsUseCase/SearchPostsUseCase'
import { ISearchPostsUseCaseOptions } from '../../../application/useCases/post/SearchPostsUseCase/SearchPostsUseCase'
import { PostApplicationMapper } from '../../../application/mappers/PostApplicationMapper'
import { IStoryLookupService } from '../../../application/services/story/StoryLookupService'
import { IStoryListSearchService } from '../../../application/services/story/StoryListSearchService'
import { IPostReadRepository } from '../../../application/read/IPostReadRepository'
import { PostDTO } from '../../../application/dtos'
import { ITransactionAware } from '@hatsuportal/platform'

export class SearchPostsScenario extends ScenarioBase<ISearchPostsUseCaseOptions, 'foundPosts', Record<string, never>> {
  protected readonly storyListSearchService: Mocked<IStoryListSearchService>
  protected readonly storyLookupService: Mocked<IStoryLookupService>
  protected readonly postReadRepository: Mocked<IPostReadRepository & ITransactionAware>

  static given() {
    return new SearchPostsScenario()
  }

  constructor() {
    super(['foundPosts'], {})
    this.storyListSearchService = Fixture.storyListSearchServiceMock()
    this.storyLookupService = Fixture.storyLookupServiceMock()
    this.postReadRepository = Fixture.postReadRepositoryMock()
  }

  lookupServiceWillReject(method: keyof IStoryListSearchService, error: Error = new Error('StoryListSearchService failure')) {
    this.storyListSearchService[method] = vi.fn().mockRejectedValue(error) as never
    return this
  }

  postReadRepositoryWillReturn(posts: PostDTO[], totalCount: number) {
    this.postReadRepository.search = vi.fn().mockResolvedValue({ posts, totalCount })
    return this
  }

  async whenExecutedWithInput(input: ISearchPostsUseCaseOptions) {
    const useCase = new SearchPostsUseCase(
      this.storyListSearchService,
      this.storyLookupService,
      this.postReadRepository,
      this.userGateway,
      new PostApplicationMapper()
    )

    await this.capture(() =>
      useCase.execute({
        loggedInUserId: input.loggedInUserId,
        searchCriteria: input.searchCriteria,
        foundPosts: this.spyOutputBoundary('foundPosts')
      })
    )

    return this
  }

  thenStoryListSearchServiceCalledTimes(method: keyof IStoryListSearchService, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.storyListSearchService[method]).toHaveBeenCalledTimes(times)
    return this
  }

  thenPostReadRepositoryCalledTimes(method: keyof IPostReadRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.postReadRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }

  thenStoryLookupServiceCalledTimes(method: keyof IStoryLookupService, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.storyLookupService[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
