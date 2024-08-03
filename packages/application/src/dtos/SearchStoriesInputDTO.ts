import { StorySearchCriteria } from '@hatsuportal/domain'

export interface SearchStoriesInputDTO {
  loggedInUserId?: string
  searchCriteria: StorySearchCriteria
}
