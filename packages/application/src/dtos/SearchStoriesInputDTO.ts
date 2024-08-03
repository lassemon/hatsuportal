import { StorySearchCriteria } from '../repositories/IStoryRepository'

export interface SearchStoriesInputDTO {
  loggedInUserId?: string
  searchCriteria: StorySearchCriteria
}
