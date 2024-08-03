import _ from 'lodash'
import {
  CreateStoryRequest,
  FetchOptions,
  StoryResponse,
  MyStoriesResponse,
  SearchStoriesRequest,
  SearchStoriesResponse,
  UpdateStoryRequest
} from '@hatsuportal/contracts'
import { Maybe } from '@hatsuportal/common'
import { IHttpClient, IStoryHttpClient } from 'application/interfaces'
import { jsonToQueryString } from './HttpClient'
import { StoryViewModel } from 'ui/features/story/viewModels/StoryViewModel'

export interface StoryListResponse {
  stories: StoryViewModel[]
  totalCount: number
}

export class StoryHttpClient implements IStoryHttpClient {
  constructor(private readonly httpClient: IHttpClient) {}

  public async create(createRequest: CreateStoryRequest): Promise<StoryResponse> {
    return await this.httpClient.postJson<StoryResponse, CreateStoryRequest>({
      ...{ endpoint: '/story', payload: createRequest }
    })
  }

  public async update(updateRequest: UpdateStoryRequest): Promise<StoryResponse> {
    return await this.httpClient.putJson<StoryResponse, UpdateStoryRequest>({
      ...{ endpoint: '/story', payload: updateRequest }
    })
  }

  async delete(storyId: string): Promise<StoryResponse> {
    return await this.httpClient.deleteJson<StoryResponse>({ ...{ endpoint: `/story/${storyId}` } })
  }

  public async findById(id: string): Promise<Maybe<StoryResponse>> {
    return await this.httpClient.getJson<StoryResponse>({ ...{ endpoint: `/story/${id ? id : ''}` } })
  }

  public async findAll(options: FetchOptions = {}): Promise<SearchStoriesResponse> {
    return await this.httpClient.getJson<SearchStoriesResponse>({ ...{ endpoint: `/stories` }, ...options })
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
      ...{ endpoint: jsonToQueryString('/stories', cleanedUpQuery) },
      ...options
    })
  }

  public async myStories(options: FetchOptions = {}): Promise<MyStoriesResponse> {
    return await this.httpClient.getJson<MyStoriesResponse>({ ...{ endpoint: `/mystories` }, ...options })
  }
}
