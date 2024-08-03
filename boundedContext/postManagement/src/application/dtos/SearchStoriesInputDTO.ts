import { StorySearchCriteria } from '../../domain'

export interface SearchStoriesInputDTO {
  loggedInUserId?: string
  searchCriteria: StorySearchCriteria
}
