import { StoryPresentationDTO } from '@hatsuportal/presentation'
import { ILocalStorageService } from 'application'

export const ITEM_STATE_NAME = 'storyState'

export class LocalStorageStoryService implements ILocalStorageService<StoryPresentationDTO> {
  constructor(private readonly localStorageRepository: ILocalStorageService<StoryPresentationDTO>) {}

  async findById() {
    const storyJSON = await this.localStorageRepository.findById(ITEM_STATE_NAME)
    return Promise.resolve(storyJSON) // Wrapping in Promise to match async interface of http requests
  }

  async store(story: StoryPresentationDTO) {
    return await this.localStorageRepository.store(story, ITEM_STATE_NAME)
  }

  async delete(id: string) {
    return await this.localStorageRepository.delete(id)
  }
}
