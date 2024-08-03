import { Maybe, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import {
  FetchOptions,
  IImagePresentationMapper,
  ImagePresentation,
  IStoryPresentationMapper,
  SearchStoriesRequest,
  StoryPresentation,
  StoryPresentationDTO
} from '@hatsuportal/presentation'
import { ILocalStorageService, IStoryHttpClient, IStoryService } from 'application'
import { StoryListResponse, StoryWithImageResponse } from 'application/services/data/IStoryService'
import { isEmpty } from 'lodash'

export const STORY_DEFAULTS = {
  NEW_STORY_ID: '46565942-654c-4f95-89b2-61478b286c13',
  DEFAULT_STORY_ID: '252a58d0-d2d3-4f08-9b2e-59322b5900ec'
}

export const defaultStory = new StoryPresentation({
  id: STORY_DEFAULTS.DEFAULT_STORY_ID,
  description: 'description',
  imageId: null,
  name: 'Frontend Default Story',
  visibility: VisibilityEnum.Public,
  createdBy: '0',
  createdByUserName: 'system',
  createdAt: unixtimeNow(),
  updatedAt: null
})

export const newStoryDTO = new StoryPresentation({
  id: STORY_DEFAULTS.NEW_STORY_ID,
  imageId: null,
  name: 'New Story',
  description: 'description',
  visibility: VisibilityEnum.Public,
  createdBy: '0',
  createdByUserName: '',
  createdAt: unixtimeNow(),
  updatedAt: null
})

export class StoryService implements IStoryService {
  constructor(
    private readonly storyHttpClient: IStoryHttpClient,
    private readonly storyPresentationMapper: IStoryPresentationMapper,
    private readonly localStorageStoryService: ILocalStorageService<StoryPresentationDTO>,
    private readonly imagePresentationMapper: IImagePresentationMapper
  ) {}

  public async create(story: StoryPresentation, image?: ImagePresentation | null, options?: FetchOptions): Promise<StoryWithImageResponse> {
    const createStoryResponse = await this.storyHttpClient.create(story, image, options)

    const createdStory = this.storyPresentationMapper.toStoryPresentation(createStoryResponse.story)
    await this.localStorageStoryService.store(createdStory)
    return {
      story: this.storyPresentationMapper.toStoryPresentation(createStoryResponse.story),
      image: createStoryResponse.image ? this.imagePresentationMapper.toImagePresentation(createStoryResponse.image) : null
    }
  }

  public async update(
    story: StoryPresentation,
    imageMetadata?: ImagePresentation | null,
    options?: FetchOptions
  ): Promise<StoryWithImageResponse> {
    const updateStoryResponse = await this.storyHttpClient.update(story, imageMetadata, options)
    const updatedStory = this.storyPresentationMapper.toStoryPresentation(updateStoryResponse.story)
    await this.localStorageStoryService.store(updatedStory)
    return {
      story: this.storyPresentationMapper.toStoryPresentation(updateStoryResponse.story),
      image: updateStoryResponse.image ? this.imagePresentationMapper.toImagePresentation(updateStoryResponse.image) : null
    }
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
      try {
        const storyFromLocalStorage = await this.localStorageStoryService.findById()
        if (storyFromLocalStorage) return this.storyPresentationMapper.toStoryPresentation(storyFromLocalStorage)
        throw new Error(`Story with id ${storyId} was not found`) // TODO, frontend specific error classes?
      } catch (error) {
        console.error(error)
        // if backend and localstorage fetch fail, return default story
        return defaultStory
      }
    }
  }

  public async findAll(options?: FetchOptions): Promise<StoryListResponse> {
    const response = await this.storyHttpClient.findAll(options)
    return {
      stories: response.stories.map(this.storyPresentationMapper.toStoryPresentation),
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
      stories: response.stories.map(this.storyPresentationMapper.toStoryPresentation),
      totalCount: response.totalCount
    }
  }

  public async myStories(options?: FetchOptions): Promise<StoryListResponse> {
    const response = await this.storyHttpClient.myStories(options)
    return {
      stories: response.stories.map(this.storyPresentationMapper.toStoryPresentation),
      totalCount: response.totalCount
    }
  }

  public async storeToLocalStorage(story: StoryPresentation): Promise<StoryPresentation> {
    await this.localStorageStoryService.store(story)
    return story
  }
}
