import { FetchOptions, SearchPostsRequest, SearchPostsResponse } from '@hatsuportal/contracts'
import { IHttpClient, IPostHttpClient } from 'application/interfaces'
import { jsonToQueryString } from './HttpClient'
import isEmpty from 'lodash/isEmpty'

export class PostHttpClient implements IPostHttpClient {
  private readonly baseUrl = '/posts'
  constructor(private readonly httpClient: IHttpClient) {}

  public async search(query: SearchPostsRequest, options: FetchOptions = {}): Promise<SearchPostsResponse> {
    const { search, visibility, postsPerPage = 10, ...mandatoryParams } = query
    const cleanedUpQuery = {
      ...mandatoryParams,
      postsPerPage,
      ...(!isEmpty(search) ? { search } : {}),
      ...(!isEmpty(visibility) ? { visibility } : {})
    }
    return await this.httpClient.getJson<SearchPostsResponse, SearchPostsRequest>({
      endpoint: jsonToQueryString(`${this.baseUrl}`, cleanedUpQuery),
      ...options
    })
  }
}
