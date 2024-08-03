import { FetchOptions, SearchPostsRequest } from '@hatsuportal/contracts'
import { PostViewModel, PostViewModelDTO } from 'ui/entities/post/model/PostViewModel'

export interface PostListResponse {
  posts: PostViewModel<PostViewModelDTO>[]
  totalCount: number
}

export interface IPostService {
  search(query: SearchPostsRequest, options?: FetchOptions): Promise<PostListResponse>
}
