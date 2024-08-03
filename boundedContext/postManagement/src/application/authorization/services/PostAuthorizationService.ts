import { createAbacEngine, IAuthorizationDecision, IAuthorizationEngine, IUserToRequesterMapper } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
import { Comment } from '../../../domain'
import {
  CreateStoryAuthorizationAttributes,
  DeleteStoryAuthorizationAttributes,
  RemoveImageFromStoryAuthorizationAttributes,
  SearchStoriesAuthorizationAttributes,
  StoryAction,
  StoryResourceType,
  storyRules,
  UpdateStoryAuthorizationAttributes,
  ViewStoryAuthorizationAttributes
} from '../rules/story.rules'
import { PostDTO, StoryDTO, StorySearchCriteriaDTO } from '../../dtos'
import {
  AddCommentAuthorizationAttributes,
  AddReplyAuthorizationAttributes,
  CommenAction,
  CommentResourceType,
  commentRules,
  EditCommentAuthorizationAttributes,
  HardDeleteAuthorizationAttributes,
  SoftDeleteAuthorizationAttributes
} from '../rules/comment.rules'
import { ICommentApplicationMapper } from '../../mappers/CommentApplicationMapper'

export interface IUserForAuthorization {
  id: string | null
  roles: UserRoleEnum[]
  active: boolean
}

export interface IPostAuthorizationService {
  canCreateStory(user: IUserForAuthorization): IAuthorizationDecision
  canUpdateStory(user: IUserForAuthorization, story: StoryDTO): IAuthorizationDecision
  canDeleteStory(user: IUserForAuthorization, story: StoryDTO): IAuthorizationDecision
  canRemoveImageFromStory(user: IUserForAuthorization, story: StoryDTO): IAuthorizationDecision
  canViewStory(user: IUserForAuthorization | null, story: StoryDTO): IAuthorizationDecision
  canSearchStories(user: IUserForAuthorization | null, searchCriteria: StorySearchCriteriaDTO): IAuthorizationDecision
  canAddComment(user: IUserForAuthorization, post: PostDTO): IAuthorizationDecision
  canAddReply(user: IUserForAuthorization, post: PostDTO, parentComment: Comment | null): IAuthorizationDecision
  canEditComment(user: IUserForAuthorization, comment: Comment): IAuthorizationDecision
  canSoftDeleteComment(user: IUserForAuthorization, comment: Comment): IAuthorizationDecision
  canHardDeleteComment(user: IUserForAuthorization, comment: Comment): IAuthorizationDecision
}

export class PostAuthorizationService {
  private readonly storyAbacEngine: IAuthorizationEngine
  private readonly commentAbacEngine: IAuthorizationEngine

  constructor(private readonly commentMapper: ICommentApplicationMapper, private readonly requesterMapper: IUserToRequesterMapper) {
    this.storyAbacEngine = createAbacEngine(storyRules)
    this.commentAbacEngine = createAbacEngine(commentRules)
  }

  public canCreateStory(user: IUserForAuthorization) {
    return this.storyAbacEngine.evaluate<CreateStoryAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: StoryAction.Create,
      resource: { type: StoryResourceType.Story }
    })
  }

  public canUpdateStory(user: IUserForAuthorization, story: StoryDTO) {
    return this.storyAbacEngine.evaluate<UpdateStoryAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: StoryAction.Update,
      resource: {
        type: StoryResourceType.Story,
        id: story.id,
        attributes: { story }
      }
    })
  }

  public canDeleteStory(user: IUserForAuthorization, story: StoryDTO) {
    return this.storyAbacEngine.evaluate<DeleteStoryAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: StoryAction.Delete,
      resource: {
        type: StoryResourceType.Story,
        id: story.id,
        attributes: { story }
      }
    })
  }

  public canRemoveImageFromStory(user: IUserForAuthorization, story: StoryDTO) {
    return this.storyAbacEngine.evaluate<RemoveImageFromStoryAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: StoryAction.RemoveImage,
      resource: {
        type: StoryResourceType.Story,
        id: story.id,
        attributes: { story }
      }
    })
  }

  public canViewStory(user: IUserForAuthorization | null, story: StoryDTO): IAuthorizationDecision {
    return this.storyAbacEngine.evaluate<ViewStoryAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user ?? null),
      action: StoryAction.View,
      resource: { type: StoryResourceType.Story, id: story.id, attributes: { story } }
    })
  }

  public canSearchStories(user: IUserForAuthorization | null, searchCriteria: StorySearchCriteriaDTO): IAuthorizationDecision {
    return this.storyAbacEngine.evaluate<SearchStoriesAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user ?? null),
      action: StoryAction.Search,
      resource: {
        type: StoryResourceType.StorySearch,
        id: 'search-stories',
        attributes: { searchCriteria }
      }
    })
  }

  canAddComment(user: IUserForAuthorization, post: PostDTO) {
    return this.commentAbacEngine.evaluate<AddCommentAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: CommenAction.Add,
      resource: { type: CommentResourceType.Post, id: post.id }
    })
  }

  canAddReply(user: IUserForAuthorization, post: PostDTO, parentComment: Comment): IAuthorizationDecision {
    return this.commentAbacEngine.evaluate<AddReplyAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: CommenAction.AddReply,
      resource: {
        type: CommentResourceType.Comment,
        id: parentComment?.id.value,
        attributes: {
          post,
          parentComment: this.commentMapper.toDTO(parentComment)
        }
      }
    })
  }

  canEditComment(user: IUserForAuthorization, comment: Comment) {
    return this.commentAbacEngine.evaluate<EditCommentAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: CommenAction.Edit,
      resource: {
        type: CommentResourceType.Comment,
        id: comment.id.value,
        attributes: { comment: this.commentMapper.toDTO(comment) }
      }
    })
  }

  canSoftDeleteComment(user: IUserForAuthorization, comment: Comment) {
    return this.commentAbacEngine.evaluate<SoftDeleteAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: CommenAction.SoftDelete,
      resource: {
        type: CommentResourceType.Comment,
        id: comment.id.value,
        attributes: { comment: this.commentMapper.toDTO(comment) }
      }
    })
  }

  canHardDeleteComment(user: IUserForAuthorization, comment: Comment) {
    return this.commentAbacEngine.evaluate<HardDeleteAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: CommenAction.HardDelete,
      resource: {
        type: CommentResourceType.Comment,
        id: comment.id.value,
        attributes: { comment: this.commentMapper.toDTO(comment) }
      }
    })
  }
}
