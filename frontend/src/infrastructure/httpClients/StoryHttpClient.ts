import _ from 'lodash'
import {
  CreateStoryRequest,
  CreateStoryResponse,
  FetchOptions,
  ImagePresentation,
  StoryPresentation,
  StoryResponse,
  MyStoriesResponse,
  SearchStoriesRequest,
  SearchStoriesResponse,
  UpdateStoryRequest,
  UpdateStoryResponse
} from '@hatsuportal/presentation'
import { Maybe } from '@hatsuportal/common'
import { IHttpClient, IStoryHttpClient } from 'application'
import { jsonToQueryString } from './HttpClient'

export interface StoryListResponse {
  stories: StoryPresentation[]
  totalCount: number
}

export interface StoryWithImageResponse {
  story: StoryPresentation
  image: Maybe<ImagePresentation>
}

export class StoryHttpClient implements IStoryHttpClient {
  constructor(private readonly httpClient: IHttpClient) {}

  public async create(story: StoryPresentation, image?: ImagePresentation | null): Promise<CreateStoryResponse> {
    return await this.httpClient.postJson<CreateStoryResponse, CreateStoryRequest>({
      ...{ endpoint: '/story', payload: { story: story.toJSON(), image: image?.toJSON() } }
    })
  }

  public async update(story: StoryPresentation, image?: ImagePresentation | null): Promise<UpdateStoryResponse> {
    return await this.httpClient.putJson<UpdateStoryResponse, UpdateStoryRequest>({
      ...{ endpoint: '/story', payload: { story: story.toJSON(), image: image?.toJSON() } }
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
