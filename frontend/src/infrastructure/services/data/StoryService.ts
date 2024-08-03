import { ImageStateEnum, Maybe, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import { IStoryPresentationMapper, SearchStoriesRequest, StoryPresentation, StoryPresentationDTO } from '@hatsuportal/presentation-post'
import { FetchOptions } from '@hatsuportal/presentation-common'
import { ILocalStorageService, IStoryHttpClient, IStoryService } from 'application'
import { StoryListResponse } from 'application/services/data/IStoryService'
import { NotFoundError } from 'infrastructure/errors/NotFoundError'
import { isEmpty } from 'lodash'

export const STORY_DEFAULTS = {
  NEW_STORY_ID: '46565942-654c-4f95-89b2-61478b286c13',
  DEFAULT_STORY_ID: '252a58d0-d2d3-4f08-9b2e-59322b5900ec'
}

const now = unixtimeNow()
export const newStoryDTO = new StoryPresentation({
  id: STORY_DEFAULTS.NEW_STORY_ID,
  image: null,
  name: 'New Story',
  description: 'description',
  visibility: VisibilityEnum.Public,
  createdById: '0',
  createdByName: '',
  createdAt: now,
  updatedAt: now,
  imageLoadState: ImageStateEnum.NotSet,
  imageLoadError: null
})

export class StoryService implements IStoryService {
  constructor(
    private readonly storyHttpClient: IStoryHttpClient,
    private readonly storyPresentationMapper: IStoryPresentationMapper,
    private readonly localStorageStoryService: ILocalStorageService<StoryPresentationDTO>
  ) {}

  public async create(story: StoryPresentation, options?: FetchOptions): Promise<StoryPresentation> {
    const createStoryResponse = await this.storyHttpClient.create(this.storyPresentationMapper.toCreateStoryRequest(story), options)

    const createdStory = this.storyPresentationMapper.toStoryPresentation(createStoryResponse)
    await this.localStorageStoryService.store(createdStory.toJSON())
    return createdStory
  }

  public async update(story: StoryPresentation, options?: FetchOptions): Promise<StoryPresentation> {
    const updateStoryResponse = await this.storyHttpClient.update(this.storyPresentationMapper.toUpdateStoryRequest(story), options)
    const updatedStory = this.storyPresentationMapper.toStoryPresentation(updateStoryResponse)
    await this.localStorageStoryService.store(updatedStory.toJSON())
    return updatedStory
  }

  public async delete(storyId: string, options?: FetchOptions): Promise<StoryPresentation> {
    await this.localStorageStoryService.delete(storyId)
    const response = await this.storyHttpClient.delete(storyId, options)
    return this.storyPresentationMapper.toStoryPresentation(response)
  }

  public async findById(storyId?: string, options?: FetchOptions): Promise<Maybe<StoryPresentation>> {
    try {
      // Attempt to fetch from the backend first
      const storyResponse = await this.storyHttpClient.findById(storyId, options)
      if (!storyResponse) {
        return null
      }
      const story = this.storyPresentationMapper.toStoryPresentation(storyResponse)
      const storedStoryPresentationDTO = await this.localStorageStoryService.findById()
      const storyFromLocalStorage = storedStoryPresentationDTO ? new StoryPresentation(storedStoryPresentationDTO) : null

      const backendDataIsNewer = story.getLatestTimestamp() >= (storyFromLocalStorage ? storyFromLocalStorage?.getLatestTimestamp() : -1)
      const shouldUpdateLocalStorage = !storedStoryPresentationDTO || backendDataIsNewer

      if (shouldUpdateLocalStorage) {
        await this.localStorageStoryService.store(story.toJSON())
      }

      return story
    } catch (error) {
      // If the backend fetch fails, attempt to retrieve from localStorage
      console.error(error)
      const storyFromLocalStorage = await this.localStorageStoryService.findById()
      if (storyFromLocalStorage && storyFromLocalStorage.id === storyId)
        return this.storyPresentationMapper.toStoryPresentation(storyFromLocalStorage)
      throw new NotFoundError(404, 'Not Found', `Story with id ${storyId} was not found`) // TODO, frontend specific error classes?
    }
  }

  public async findAll(options?: FetchOptions): Promise<StoryListResponse> {
    const response = await this.storyHttpClient.findAll(options)
    return {
      stories: response.stories.map((story) => this.storyPresentationMapper.toStoryPresentation(story)),
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
      stories: response.stories.map((story) => this.storyPresentationMapper.toStoryPresentation(story)),
      totalCount: response.totalCount
    }
  }

  public async myStories(options?: FetchOptions): Promise<StoryListResponse> {
    const response = await this.storyHttpClient.myStories(options)
    return {
      stories: response.stories.map((story) => this.storyPresentationMapper.toStoryPresentation(story)),
      totalCount: response.totalCount
    }
  }

  public async storeToLocalStorage(story: StoryPresentation): Promise<StoryPresentation> {
    await this.localStorageStoryService.store(story.toJSON())
    return story
  }
}
