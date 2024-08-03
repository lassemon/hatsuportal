import { FetchOptions, SearchPostsRequest, SearchPostsResponse } from '@hatsuportal/contracts'

export interface IPostHttpClient {
  search(query: SearchPostsRequest, options?: FetchOptions): Promise<SearchPostsResponse>
}
