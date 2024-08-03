import { CreateStoryRequest, FetchOptions, SearchStoriesRequest, UpdateStoryRequest } from '@hatsuportal/contracts'
import { ILocalStorageService, IStoryHttpClient, IStoryService, IStoryViewModelMapper, StoryListResponse } from 'application/interfaces'
import { StoryViewModel, StoryViewModelDTO } from 'ui/features/post/story/viewModels/StoryViewModel'
import { isEmpty } from 'lodash'
import { Maybe } from '@hatsuportal/common'
import { NotFoundError } from 'infrastructure/errors/NotFoundError'

export const STORY_DEFAULTS = {
  NEW_STORY_ID: '46565942-654c-4f95-89b2-61478b286c13',
  DEFAULT_STORY_ID: '252a58d0-d2d3-4f08-9b2e-59322b5900ec'
}

const STORY_STATE_KEY = 'storyState'

export class StoryService implements IStoryService {
  constructor(
    private readonly storyHttpClient: IStoryHttpClient,
    private readonly storyViewModelMapper: IStoryViewModelMapper,
    private readonly localStorage: ILocalStorageService<StoryViewModelDTO>
  ) {}

  public async create(createPayload: CreateStoryRequest, options?: FetchOptions): Promise<StoryViewModel> {
    const createStoryResponse = await this.storyHttpClient.create(this.storyViewModelMapper.toCreateStoryRequest(createPayload), options)

    const createdStory = this.storyViewModelMapper.toViewModel(createStoryResponse)
    await this.localStorage.store(createdStory.toJSON(), STORY_STATE_KEY)
    return createdStory
  }

  public async update(storyId: string, updatePayload: UpdateStoryRequest, options?: FetchOptions): Promise<StoryViewModel> {
    const updateStoryResponse = await this.storyHttpClient.update(
      storyId,
      this.storyViewModelMapper.toUpdateStoryRequest(updatePayload),
      options
    )
    const updatedStory = this.storyViewModelMapper.toViewModel(updateStoryResponse)
    await this.localStorage.store(updatedStory.toJSON(), STORY_STATE_KEY)
    return updatedStory
  }

  public async delete(storyId: string, options?: FetchOptions): Promise<StoryViewModel> {
    await this.localStorage.delete(STORY_STATE_KEY)
    const response = await this.storyHttpClient.delete(storyId, options)
    return this.storyViewModelMapper.toViewModel(response)
  }

  public async findById(storyId?: string, options?: FetchOptions): Promise<Maybe<StoryViewModel>> {
    try {
      // Attempt to fetch from the backend first
      const storyResponse = await this.storyHttpClient.findById(storyId, options)
      if (!storyResponse) {
        return null
      }
      const story = this.storyViewModelMapper.toViewModel(storyResponse)
      const storedStoryViewModelDTO = await this.localStorage.findById()
      const storyFromLocalStorage = storedStoryViewModelDTO ? new StoryViewModel(storedStoryViewModelDTO) : null

      const backendDataIsNewer = story.getLatestTimestamp() >= (storyFromLocalStorage ? storyFromLocalStorage?.getLatestTimestamp() : -1)
      const shouldUpdateLocalStorage = !storedStoryViewModelDTO || backendDataIsNewer

      if (shouldUpdateLocalStorage) {
        await this.localStorage.store(story.toJSON(), STORY_STATE_KEY)
      }

      return story
    } catch (error) {
      // If the backend fetch fails, attempt to retrieve from localStorage
      console.error(error)
      const storyFromLocalStorage = await this.localStorage.findById()
      if (storyFromLocalStorage && storyFromLocalStorage.id === storyId) return this.storyViewModelMapper.toViewModel(storyFromLocalStorage)
      throw new NotFoundError(404, 'Not Found', `Story with id ${storyId} was not found`) // TODO, frontend specific error classes?
    }
  }

  public async findAll(options?: FetchOptions): Promise<StoryListResponse> {
    const response = await this.storyHttpClient.findAll(options)
    return {
      stories: response.stories.map((story) => this.storyViewModelMapper.toViewModel(story)),
      totalCount: response.totalCount
    }
  }

  public async search(query: SearchStoriesRequest, options?: FetchOptions): Promise<StoryListResponse> {
    const { search, visibility, storiesPerPage = 50, ...mandatoryParams } = query
    const cleanedUpQuery = {
      ...mandatoryParams,
      storiesPerPage,
      ...(!isEmpty(search) ? { search } : {}),
      ...(!isEmpty(visibility) ? { visibility } : {})
    }
    const response = await this.storyHttpClient.search(cleanedUpQuery, options)
    return {
      stories: response.stories.map((story) => this.storyViewModelMapper.toViewModel(story)),
      totalCount: response.totalCount
    }
  }

  public async myStories(options?: FetchOptions): Promise<StoryListResponse> {
    const response = await this.storyHttpClient.myStories(options)
    return {
      stories: response.stories.map((story) => this.storyViewModelMapper.toViewModel(story)),
      totalCount: response.totalCount
    }
  }

  public async storeToLocalStorage(story: StoryViewModel): Promise<StoryViewModel> {
    await this.localStorage.store(story.toJSON(), STORY_STATE_KEY)
    return story
  }
}
