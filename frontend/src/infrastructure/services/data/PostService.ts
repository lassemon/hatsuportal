import { FetchOptions, SearchPostsRequest } from '@hatsuportal/contracts'
import { IPostHttpClient, IPostService, PostListResponse } from 'application/interfaces'
import { IPostViewModelMapper } from 'application/interfaces/http/mappers/IPostViewModelMapper'

export class PostService implements IPostService {
  constructor(
    private readonly postHttpClient: IPostHttpClient,
    private readonly postViewModelMapper: IPostViewModelMapper
  ) {}

  public async search(query: SearchPostsRequest, options?: FetchOptions): Promise<PostListResponse> {
    const response = await this.postHttpClient.search(query, options)
    return {
      posts: response.posts.map((post) => this.postViewModelMapper.toViewModel(post)),
      totalCount: response.totalCount
    }
  }
}
