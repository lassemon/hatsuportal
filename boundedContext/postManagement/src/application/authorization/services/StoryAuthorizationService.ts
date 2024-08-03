import { IAuthorizationDecision, IUserForAuthorization, AuthorizationServiceBase } from '@hatsuportal/platform'
import { StoryAction, StoryAuthorizationPayloadMap } from '../rules/story.rules'
import { StoryDTO, StorySearchCriteriaDTO } from '../../dtos'

export interface IStoryAuthorizationService {
  canCreateStory(user: IUserForAuthorization): IAuthorizationDecision
  canUpdateStory(user: IUserForAuthorization, story: StoryDTO): IAuthorizationDecision
  canDeleteStory(user: IUserForAuthorization, story: StoryDTO): IAuthorizationDecision
  canRemoveImageFromStory(user: IUserForAuthorization, story: StoryDTO): IAuthorizationDecision
  canViewStory(user: IUserForAuthorization | null, story: StoryDTO): IAuthorizationDecision
  canSearchStories(user: IUserForAuthorization | null, searchCriteria: StorySearchCriteriaDTO): IAuthorizationDecision
}

export class StoryAuthorizationService
  extends AuthorizationServiceBase<StoryAction, StoryAuthorizationPayloadMap>
  implements IStoryAuthorizationService
{
  canCreateStory(user: IUserForAuthorization) {
    return this.authorize(StoryAction.Create, user)
  }

  canUpdateStory(user: IUserForAuthorization, story: StoryDTO) {
    return this.authorize(StoryAction.Update, user, { story })
  }

  canDeleteStory(user: IUserForAuthorization, story: StoryDTO) {
    return this.authorize(StoryAction.Delete, user, { story })
  }

  canRemoveImageFromStory(user: IUserForAuthorization, story: StoryDTO) {
    return this.authorize(StoryAction.RemoveImage, user, { story })
  }

  canViewStory(user: IUserForAuthorization | null, story: StoryDTO) {
    return this.authorize(StoryAction.View, user, { story })
  }

  canSearchStories(user: IUserForAuthorization | null, searchCriteria: StorySearchCriteriaDTO) {
    return this.authorize(StoryAction.Search, user, { searchCriteria })
  }
}
