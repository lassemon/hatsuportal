import _ from 'lodash'
import {
  CreateStoryRequest,
  FetchOptions,
  MyStoriesResponse,
  SearchStoriesRequest,
  SearchStoriesResponse,
  UpdateStoryRequest,
  StoryWithRelationsResponse
} from '@hatsuportal/contracts'
import { IHttpClient, IStoryHttpClient } from 'application/interfaces'
import { jsonToQueryString } from './HttpClient'
import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'
import { Maybe } from '@hatsuportal/common'

export interface StoryListResponse {
  stories: StoryViewModel[]
  totalCount: number
}

export class StoryHttpClient implements IStoryHttpClient {
  private readonly baseUrl = '/stories'
  constructor(private readonly httpClient: IHttpClient) {}

  public async create(createRequest: CreateStoryRequest): Promise<StoryWithRelationsResponse> {
    return await this.httpClient.postJson<StoryWithRelationsResponse, CreateStoryRequest>({
      endpoint: `${this.baseUrl}`,
      payload: createRequest
    })
  }

  public async update(storyId: string, updateRequest: UpdateStoryRequest): Promise<StoryWithRelationsResponse> {
    return await this.httpClient.patchJson<StoryWithRelationsResponse, UpdateStoryRequest>({
      endpoint: `${this.baseUrl}/${storyId}`,
      payload: updateRequest
    })
  }

  async delete(storyId: string): Promise<StoryWithRelationsResponse> {
    return await this.httpClient.deleteJson<StoryWithRelationsResponse>({ endpoint: `${this.baseUrl}/${storyId}` })
  }

  public async findById(id: string): Promise<Maybe<StoryWithRelationsResponse>> {
    return await this.httpClient.getJson<StoryWithRelationsResponse>({ endpoint: `${this.baseUrl}/${id ? id : ''}` })
  }

  public async findAll(options: FetchOptions = {}): Promise<SearchStoriesResponse> {
    return await this.httpClient.getJson<SearchStoriesResponse>({ endpoint: `${this.baseUrl}`, ...options })
  }

  public async search(query: SearchStoriesRequest, options: FetchOptions = {}): Promise<SearchStoriesResponse> {
    const { search, visibility, storiesPerPage = 50, ...mandatoryParams } = query
    const cleanedUpQuery = {
      ...mandatoryParams,
      storiesPerPage,
      ...(!_.isEmpty(search) ? { search } : {}),
      ...(!_.isEmpty(visibility) ? { visibility } : {})
    }
    return await this.httpClient.getJson<SearchStoriesResponse, SearchStoriesRequest>({
      endpoint: jsonToQueryString(`${this.baseUrl}`, cleanedUpQuery),
      ...options
    })
  }

  public async myStories(options: FetchOptions = {}): Promise<MyStoriesResponse> {
    return await this.httpClient.getJson<MyStoriesResponse>({ endpoint: `${this.baseUrl}/my`, ...options })
  }
}
